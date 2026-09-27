// ===== Data Storage =====
let friends = JSON.parse(localStorage.getItem('friends')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// ===== DOM Elements =====
const friendNameInput = document.getElementById('friend-name-input');
const addFriendBtn = document.getElementById('add-friend-btn');
const friendsList = document.getElementById('friends-list');
const friendError = document.getElementById('friend-error');

const expenseFriendSelect = document.getElementById('expense-friend-select');
const expenseAmountInput = document.getElementById('expense-amount-input');
const addExpenseBtn = document.getElementById('add-expense-btn');
const expenseList = document.getElementById('expense-list');
const expenseError = document.getElementById('expense-error');

const calculateBtn = document.getElementById('calculate-btn');
const resultOutput = document.getElementById('result-output');

const saveHistoryBtn = document.getElementById('save-history-btn');
const historyOutput = document.getElementById('history-output');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const chartOutput = document.getElementById('chart-output');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// ===== Save to localStorage =====
function saveData() {
  localStorage.setItem('friends', JSON.stringify(friends));
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('history', JSON.stringify(history));
}

// ===== Theme Toggle =====
if (localStorage.getItem('theme') === 'dark') {
  document.body.setAttribute('data-theme', 'dark');
  themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.body.removeAttribute('data-theme');
    themeToggleBtn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    document.body.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
});

// ===== Render Friends List + Dropdown =====
function renderFriends() {
  friendsList.innerHTML = '';
  expenseFriendSelect.innerHTML = '';

  friends.forEach((name, index) => {
    const li = document.createElement('li');
    li.className = 'list-item-row';

    const span = document.createElement('span');
    span.textContent = name;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => editFriend(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteFriend(index));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(btnGroup);
    friendsList.appendChild(li);

    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    expenseFriendSelect.appendChild(option);
  });
}

// ===== Edit / Delete Friend =====
function editFriend(index) {
  const newName = prompt('Enter new name:', friends[index]);
  if (newName && newName.trim() !== '') {
    const oldName = friends[index];
    friends[index] = newName.trim();
    // Purane expenses mein naam bhi update karo
    expenses.forEach(exp => {
      if (exp.name === oldName) exp.name = newName.trim();
    });
    saveData();
    renderFriends();
    renderExpenses();
    renderChart();
  }
}

function deleteFriend(index) {
  const name = friends[index];
  if (!confirm(`${name} Their expenses will also be deleted.`)) return;
  friends.splice(index, 1);
  expenses = expenses.filter(exp => exp.name !== name);
  saveData();
  renderFriends();
  renderExpenses();
  renderChart();
}

// ===== Render Expense List =====
function renderExpenses() {
  expenseList.innerHTML = '';
  expenses.forEach((exp, index) => {
    const li = document.createElement('li');
    li.className = 'list-item-row';

    const span = document.createElement('span');
    span.textContent = `${exp.name} — Rs. ${exp.amount}`;

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => editExpense(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteExpense(index));

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(btnGroup);
    expenseList.appendChild(li);
  });
}

// ===== Edit / Delete Expense =====
function editExpense(index) {
  const newAmount = prompt('Enter new amount:', expenses[index].amount);
  const parsed = parseFloat(newAmount);
  if (!isNaN(parsed) && parsed > 0) {
    expenses[index].amount = parsed;
    saveData();
    renderExpenses();
    renderChart();
  }
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveData();
  renderExpenses();
  renderChart();
}

// ===== Add Friend (with validation) =====
addFriendBtn.addEventListener('click', () => {
  const name = friendNameInput.value.trim();
  friendError.textContent = '';

  if (name === '') {
    friendError.textContent = 'Name is required.';
    return;
  }
  if (friends.includes(name)) {
    friendError.textContent = 'This name already exists.';
    return;
  }

  friends.push(name);
  friendNameInput.value = '';
  saveData();
  renderFriends();
  renderChart();
});

// ===== Add Expense (with validation) =====
addExpenseBtn.addEventListener('click', () => {
  const name = expenseFriendSelect.value;
  const amount = parseFloat(expenseAmountInput.value);
  expenseError.textContent = '';

  if (!name) {
    expenseError.textContent = 'Please add a friend first.';
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    expenseError.textContent = 'Please enter a valid amount.';
    return;
  }

  expenses.push({ name, amount });
  expenseAmountInput.value = '';
  saveData();
  renderExpenses();
  renderChart();
});

// ===== Render Expense Summary Chart =====
function renderChart() {
  chartOutput.innerHTML = '';

  if (expenses.length === 0) {
    chartOutput.innerHTML = '<p>No expenses added yet.</p>';
    return;
  }

  const totals = {};
  friends.forEach(name => totals[name] = 0);
  expenses.forEach(exp => {
    totals[exp.name] = (totals[exp.name] || 0) + exp.amount;
  });

  const maxAmount = Math.max(...Object.values(totals), 1);

  Object.entries(totals).forEach(([name, amount]) => {
    const row = document.createElement('div');
    row.className = 'chart-row';

    const label = document.createElement('span');
    label.className = 'chart-label';
    label.textContent = `${name} (Rs. ${amount})`;

    const barBg = document.createElement('div');
    barBg.className = 'chart-bar-bg';
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.width = `${(amount / maxAmount) * 100}%`;
    barBg.appendChild(bar);

    row.appendChild(label);
    row.appendChild(barBg);
    chartOutput.appendChild(row);
  });
}

// ===== Calculate Settle-Up =====
calculateBtn.addEventListener('click', () => {
  if (friends.length === 0 || expenses.length === 0) {
    resultOutput.innerHTML = '<p>Please add friends and expenses first.</p>';
    return;
  }

  const totals = {};
  friends.forEach(name => totals[name] = 0);
  expenses.forEach(exp => {
    totals[exp.name] = (totals[exp.name] || 0) + exp.amount;
  });

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  const share = grandTotal / friends.length;

  const balances = friends.map(name => ({
    name,
    balance: parseFloat((totals[name] - share).toFixed(2))
  }));

  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);

  const transactions = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) {
      transactions.push(`${debtor.name} → ${creditor.name}: Rs. ${amount.toFixed(2)}`);
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  let html = `<p><strong>Total: Rs. ${grandTotal.toFixed(2)}</strong> | Per head: Rs. ${share.toFixed(2)}</p>`;
  if (transactions.length === 0) {
    html += '<p>Everyone is settled up! 🎉</p>';
  } else {
    transactions.forEach(t => {
      html += `<div class="settle-line">${t}</div>`;
    });
  }
  resultOutput.innerHTML = html;
});

// ===== Save Current Split to History =====
saveHistoryBtn.addEventListener('click', () => {
  if (expenses.length === 0) return;

  const entry = {
    date: new Date().toLocaleDateString(),
    friends: [...friends],
    expenses: [...expenses]
  };

  history.push(entry);
  saveData();
  renderHistory();

  expenses = [];
  saveData();
  renderExpenses();
  renderChart();
  resultOutput.innerHTML = '';
});

// ===== Clear All History =====
clearHistoryBtn.addEventListener('click', () => {
  if (!confirm('Delete all history?')) return;
  history = [];
  saveData();
  renderHistory();
});

// ===== Render History =====
function renderHistory() {
  historyOutput.innerHTML = '';
  history.forEach((entry, index) => {
    // index history array ka hai, lekin display reverse order mein karni hai
    const actualIndex = index;
    const div = document.createElement('div');
    div.className = 'settle-line';

    const header = document.createElement('div');
    header.className = 'history-entry-header';

    const dateSpan = document.createElement('strong');
    dateSpan.textContent = entry.date;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'history-delete-btn';
    deleteBtn.addEventListener('click', () => deleteHistoryEntry(actualIndex));

    header.appendChild(dateSpan);
    header.appendChild(deleteBtn);

    const expList = entry.expenses.map(e => `${e.name}: Rs. ${e.amount}`).join(', ');
    const detailsP = document.createElement('div');
    detailsP.textContent = expList;

    div.appendChild(header);
    div.appendChild(detailsP);
    historyOutput.appendChild(div);
  });

  // Latest entry sabse upar dikhane ke liye reverse karke wapas render karo
  const children = Array.from(historyOutput.children).reverse();
  historyOutput.innerHTML = '';
  children.forEach(child => historyOutput.appendChild(child));
}

// ===== Delete Single History Entry =====
function deleteHistoryEntry(index) {
  if (!confirm('Delete this history entry?')) return;
  history.splice(index, 1);
  saveData();
  renderHistory();
}

// ===== Initial Render on Page Load =====
renderFriends();
renderExpenses();
renderChart();
renderHistory();

// ===== Register Service Worker (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service worker registered'))
      .catch((err) => console.error('Service worker failed:', err));
  });
}