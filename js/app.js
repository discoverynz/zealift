// Zealift — app.js (Pass 1: auth + Track, real Supabase sync)

const DAY_NAMES = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DAY_LABELS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CATEGORIES = ["Free Weights","Plate-Loaded","Pin-Loaded","Cable","Other"];

const QUOTES = [
  {t:"The impediment to action advances action.", a:"Marcus Aurelius"},
  {t:"We suffer more in imagination than in reality.", a:"Seneca"},
  {t:"What does not kill me makes me stronger.", a:"Nietzsche"},
  {t:"Be like water making its way through cracks.", a:"Bruce Lee"},
  {t:"Knowing yourself is the beginning of all wisdom.", a:"Aristotle"},
  {t:"Patience is bitter, but its fruit is sweet.", a:"Rousseau"},
  {t:"A journey of a thousand miles begins with a single step.", a:"Lao Tzu"},
  {t:"It does not matter how slowly you go, as long as you do not stop.", a:"Confucius"},
  {t:"Difficulties strengthen the mind, as labor does the body.", a:"Seneca"},
  {t:"The cave you fear to enter holds the treasure you seek.", a:"Joseph Campbell"},
  {t:"Discipline is the bridge between goals and accomplishment.", a:"Jim Rohn"},
  {t:"You must do the things you think you cannot do.", a:"Eleanor Roosevelt"},
  {t:"Strength does not come from winning. Your struggles develop your strengths.", a:"Arnold Schwarzenegger"},
  {t:"The mind is the limit — what it can conceive, you can achieve.", a:"Arnold Schwarzenegger"},
  {t:"Everybody wants to be a bodybuilder, but nobody wants to lift heavy weights.", a:"Ronnie Coleman"},
  {t:"Pain is just weakness leaving the body.", a:"Gym proverb"},
  {t:"The iron never lies to you.", a:"Henry Rollins"},
  {t:"You don't have to be extreme, just consistent.", a:"Gym proverb"},
  {t:"The last few reps are what make the muscle grow.", a:"Ronnie Coleman"},
  {t:"Suffer the pain of discipline, or suffer the pain of regret.", a:"Jim Rohn"},
  {t:"Strength grows in the moments you think you can't go on.", a:"Gym proverb"},
  {t:"What hurts today makes you stronger tomorrow.", a:"Jay Cutler"},
  {t:"The body achieves what the mind believes.", a:"Gym proverb"},
  {t:"Fall in love with the process; the results will come.", a:"Gym proverb"},
  {t:"Champions keep playing until they get it right.", a:"Billie Jean King"},
  {t:"There is no substitute for hard work.", a:"Thomas Edison"},
  {t:"Out of suffering have emerged the strongest souls.", a:"Khalil Gibran"},
  {t:"He who has a why to live can bear almost any how.", a:"Nietzsche"},
  {t:"The obstacle is the way.", a:"Stoic proverb"},
  {t:"We are what we repeatedly do.", a:"Aristotle"},
  {t:"Make the best use of what is in your power.", a:"Epictetus"},
  {t:"Endurance is patience concentrated.", a:"Thomas Carlyle"},
  {t:"Small steps, every single day.", a:"Gym proverb"},
  {t:"Form follows discipline.", a:"Gym proverb"},
  {t:"Strong people are harder to kill, and more useful in general.", a:"Mark Rippetoe"},
  {t:"Weak is a choice.", a:"Gym proverb"},
  {t:"You don't find willpower — you build it, one rep at a time.", a:"Gym proverb"},
  {t:"The only bad workout is the one that didn't happen.", a:"Gym proverb"},
  {t:"Lift heavy, recover hard, repeat.", a:"Gym proverb"},
  {t:"Comfort is the enemy of progress.", a:"Gym proverb"},
  {t:"He who conquers himself is the mightiest warrior.", a:"Confucius"},
  {t:"It's not the mountain we conquer, but ourselves.", a:"Edmund Hillary"},
  {t:"Move a little every day, even when it's hard.", a:"Gym proverb"},
  {t:"The pain you feel today is the strength you feel tomorrow.", a:"Gym proverb"},
  {t:"He who is not satisfied with a little is satisfied with nothing.", a:"Epicurus"},
  {t:"Man is troubled not by real problems but by imagined anxieties.", a:"Epictetus"},
  {t:"The successful warrior is the average man, with laser-like focus.", a:"Bruce Lee"},
  {t:"The wound is the place where the light enters you.", a:"Rumi"},
  {t:"Amor fati — love your fate, for it is what you have.", a:"Stoic maxim"},
  {t:"Sweat is just fat, crying.", a:"Gym proverb"}
];

function todayQuote(){
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const idx = Math.floor((d - start) / 86400000);
  return QUOTES[idx % QUOTES.length];
}
// JS getDay(): Sun=0..Sat=6. Our schema: Mon=0..Sun=6.
function todayWeekday(){ const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }

const app = document.getElementById('app');
let state = { selectedDay: todayWeekday(), exercises: [], session: null };

const ICON_TRACK = `<svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="4" height="16" rx="1.2"/><rect x="17" y="4" width="4" height="16" rx="1.2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>`;
const ICON_SCALE = `<svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="17" rx="3"/><circle cx="12" cy="12.5" r="5"/><line x1="12" y1="12.5" x2="15" y2="10"/></svg>`;
const ICON_PHASE = `<svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 3h16 M4 21h16 M5 3c0 6 7 7 7 9s-7 3-7 9 M19 3c0 6-7 7-7 9s7 3 7 9"/></svg>`;
const ICON_ME = `<svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="7.5" r="4"/><path d="M3 21c0-5 4-8 9-8s9 3 9 8"/></svg>`;
const ICON_CHECK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3FCB7E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function renderTabbar(){
  return `<div class="tabbar">
    <button class="tab-item active">${ICON_TRACK}<span>Track</span></button>
    <button class="tab-item" disabled style="opacity:.35">${ICON_SCALE}<span>Scale</span></button>
    <div class="fab-wrap"><button class="fab" id="fabBtn"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1B1C1F" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button></div>
    <button class="tab-item" disabled style="opacity:.35">${ICON_PHASE}<span>Phase</span></button>
    <button class="tab-item" disabled style="opacity:.35">${ICON_ME}<span>Me</span></button>
  </div>`;
}

// ---------- LOGIN ----------
function renderLogin(){
  app.innerHTML = `
    <div class="app-shell">
      <div class="login-wrap">
        <div class="logo-circle"><img src="icons/icon-192.png" width="32" height="32" alt=""></div>
        <div class="app-name">Zealift</div>
        <div class="login-sub">Sign in to sync your data</div>
        <input class="input-field" id="emailInput" type="email" placeholder="you@email.com" autocomplete="email">
        <button class="btn-primary" id="sendLinkBtn">Send Magic Link</button>
        <div class="login-status" id="loginStatus"></div>
        <div class="login-error" id="loginError"></div>
        <div class="login-note">We'll email you a sign-in link. No password to remember or lose.</div>
      </div>
    </div>`;

  document.getElementById('sendLinkBtn').onclick = async () => {
    const email = document.getElementById('emailInput').value.trim();
    const statusEl = document.getElementById('loginStatus');
    const errEl = document.getElementById('loginError');
    statusEl.textContent = ''; errEl.textContent = '';
    if (!email || !email.includes('@')){ errEl.textContent = 'Enter a valid email.'; return; }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    });
    if (error){ errEl.textContent = error.message; }
    else { statusEl.textContent = 'Check your email for the sign-in link.'; }
  };
}

// ---------- TRACK ----------
async function loadExercises(){
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name, category')
    .eq('weekday', state.selectedDay)
    .order('category', { ascending: true });
  if (error){ console.error(error); state.exercises = []; return; }

  // For each exercise, get its most recent set (any date) and today's set if logged today.
  const withLogs = await Promise.all((exercises || []).map(async (ex) => {
    const { data: lastSet } = await supabase
      .from('sets').select('weight, weight_unit, reps, num_sets, logged_at')
      .eq('exercise_id', ex.id).order('logged_at', { ascending: false }).limit(1);
    const todayStr = new Date().toISOString().slice(0,10);
    const loggedToday = lastSet && lastSet[0] && lastSet[0].logged_at === todayStr;
    return { ...ex, lastSet: lastSet && lastSet[0], loggedToday };
  }));
  state.exercises = withLogs;
}

function exerciseRow(ex){
  const doneToday = ex.loggedToday;
  const subtitle = doneToday
    ? `✓ Logged today — ${ex.lastSet.weight}${ex.lastSet.weight_unit}${ex.lastSet.reps ? ' × ' + ex.lastSet.reps : ''}`
    : (ex.lastSet ? `${ex.lastSet.weight}${ex.lastSet.weight_unit} · ${ex.lastSet.logged_at}` : 'Not logged yet');
  return `<div class="exercise" data-id="${ex.id}" data-name="${ex.name}">
    <div><div class="ex-name">${ex.name}</div><div class="ex-last ${doneToday ? 'done' : ''}">${subtitle}</div></div>
    ${doneToday ? `<div class="check-circle">${ICON_CHECK}</div>` : `<div class="chev">›</div>`}
  </div>`;
}

async function renderTrack(){
  await loadExercises();
  const grouped = {};
  CATEGORIES.forEach(c => grouped[c] = []);
  state.exercises.forEach(ex => { (grouped[ex.category] || (grouped[ex.category] = [])).push(ex); });

  const q = todayQuote();
  const dayChips = DAY_NAMES.map((d, i) => {
    const isSelected = i === state.selectedDay;
    const isToday = i === todayWeekday();
    return `<button class="day ${isSelected ? 'active' : ''} ${isToday ? 'today-marker' : ''}" data-day="${i}">${d}</button>`;
  }).join('');

  let listHtml = '';
  CATEGORIES.forEach(cat => {
    const items = grouped[cat] || [];
    if (items.length === 0) return;
    listHtml += `<div class="category">${cat}</div>` + items.map(exerciseRow).join('');
  });
  if (state.exercises.length === 0){
    listHtml = `<div class="empty-state">No exercises set for ${DAY_LABELS[state.selectedDay]} yet.<br>
      <button class="btn-primary" id="emptyAddBtn">+ Add an Exercise</button></div>`;
  }

  app.innerHTML = `
    <div class="app-shell">
      <div class="scroll-area">
        <div class="brandbar"><img src="icons/icon-32.png" alt=""><div class="name">ZEALIFT</div></div>
        <div class="day-strip">${dayChips}</div>
        <div class="header">
          <div class="eyebrow">${DAY_LABELS[state.selectedDay].toUpperCase()}</div>
          <h1>Today's Lifts</h1>
          <div class="quote">"${q.t}" — ${q.a}</div>
        </div>
        ${listHtml}
      </div>
      ${renderTabbar()}
    </div>`;

  document.querySelectorAll('.day').forEach(el => {
    el.onclick = () => { state.selectedDay = parseInt(el.dataset.day, 10); renderTrack(); };
  });
  document.querySelectorAll('.exercise').forEach(el => {
    el.onclick = () => openLogForm(el.dataset.id, el.dataset.name);
  });
  const emptyBtn = document.getElementById('emptyAddBtn');
  if (emptyBtn) emptyBtn.onclick = openNewExerciseForm;
  document.getElementById('fabBtn').onclick = openPicker;
}

// ---------- PICKER (the + button on Track) ----------
function openPicker(){
  const rows = state.exercises.map(ex =>
    `<div class="pick-row" data-id="${ex.id}" data-name="${ex.name}">
      <div><div class="ex-name">${ex.name}</div></div><div class="chev">›</div>
    </div>`).join('');

  const overlay = document.createElement('div');
  overlay.className = 'overlay-screen';
  overlay.innerHTML = `
    <div class="form-header"><button id="closePicker">✕</button><h1>Log a Set</h1><div style="width:18px;"></div></div>
    <div class="overlay-scroll">
      ${rows || '<div class="empty-state">Nothing on today\'s list yet.</div>'}
      <div class="field-label" style="padding-top:18px;">Not on today's list?</div>
      <div class="pick-row" id="createNewRow"><div class="ex-name" style="color:var(--flame);">+ Create New Exercise</div></div>
    </div>`;
  app.querySelector('.app-shell').appendChild(overlay);
  overlay.querySelector('#closePicker').onclick = () => overlay.remove();
  overlay.querySelectorAll('.pick-row[data-id]').forEach(el => {
    el.onclick = () => { overlay.remove(); openLogForm(el.dataset.id, el.dataset.name); };
  });
  overlay.querySelector('#createNewRow').onclick = () => { overlay.remove(); openNewExerciseForm(); };
}

// ---------- NEW EXERCISE FORM ----------
function openNewExerciseForm(){
  let selectedCategory = CATEGORIES[0];
  const overlay = document.createElement('div');
  overlay.className = 'overlay-screen';
  overlay.innerHTML = `
    <div class="form-header"><button id="closeForm">✕</button><h1>New Exercise</h1><div style="width:18px;"></div></div>
    <div class="overlay-scroll">
      <div class="field-label">Name</div>
      <div class="field-card"><input class="field-input" id="exNameInput" placeholder="e.g. Incline Dumbbell Press" style="font-size:14px; font-weight:400;"></div>
      <div class="field-label">Category</div>
      <div class="chip-row">${CATEGORIES.map((c,i) => `<div class="chip ${i===0?'active':''}" data-cat="${c}">${c}</div>`).join('')}</div>
      <div class="field-label">Day</div>
      <div class="chip-row">${DAY_NAMES.map((d,i) => `<div class="chip ${i===state.selectedDay?'active':''}" data-day="${i}">${d}</div>`).join('')}</div>
      <button class="save-btn" id="saveExerciseBtn">Add Exercise</button>
    </div>`;
  let selectedDay = state.selectedDay;
  app.querySelector('.app-shell').appendChild(overlay);
  overlay.querySelector('#closeForm').onclick = () => overlay.remove();
  overlay.querySelectorAll('.chip[data-cat]').forEach(el => {
    el.onclick = () => { overlay.querySelectorAll('.chip[data-cat]').forEach(c=>c.classList.remove('active')); el.classList.add('active'); selectedCategory = el.dataset.cat; };
  });
  overlay.querySelectorAll('.chip[data-day]').forEach(el => {
    el.onclick = () => { overlay.querySelectorAll('.chip[data-day]').forEach(c=>c.classList.remove('active')); el.classList.add('active'); selectedDay = parseInt(el.dataset.day,10); };
  });
  overlay.querySelector('#saveExerciseBtn').onclick = async () => {
    const name = document.getElementById('exNameInput').value.trim();
    if (!name) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('exercises').insert({
      user_id: userData.user.id, name, category: selectedCategory, weekday: selectedDay
    });
    if (error){ alert(error.message); return; }
    overlay.remove();
    state.selectedDay = selectedDay;
    renderTrack();
  };
}

// ---------- LOG SET FORM ----------
function openLogForm(exerciseId, exerciseName){
  let unit = 'kg';
  const overlay = document.createElement('div');
  overlay.className = 'overlay-screen';
  overlay.innerHTML = `
    <div class="form-header"><button id="closeLog">✕</button><h1>${exerciseName}</h1><div style="width:18px;"></div></div>
    <div class="overlay-scroll">
      <div class="field-label">Weight</div>
      <div class="field-card">
        <input class="field-input" id="weightInput" type="number" inputmode="decimal" placeholder="0">
        <div class="unit-toggle"><button class="active" data-u="kg">kg</button><button data-u="lb">lb</button></div>
      </div>
      <div class="field-label">Sets <span class="opt">(optional)</span></div>
      <div class="field-card"><input class="field-input" id="setsInput" type="number" inputmode="numeric" placeholder="—"></div>
      <div class="field-label">Reps <span class="opt">(optional)</span></div>
      <div class="field-card"><input class="field-input" id="repsInput" type="number" inputmode="numeric" placeholder="—"></div>
      <button class="save-btn" id="saveSetBtn">Save Set</button>
    </div>`;
  app.querySelector('.app-shell').appendChild(overlay);
  overlay.querySelector('#closeLog').onclick = () => overlay.remove();
  overlay.querySelectorAll('.unit-toggle button').forEach(b => {
    b.onclick = () => { overlay.querySelectorAll('.unit-toggle button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); unit = b.dataset.u; };
  });
  overlay.querySelector('#saveSetBtn').onclick = async () => {
    const weight = parseFloat(document.getElementById('weightInput').value);
    if (!weight){ alert('Enter a weight.'); return; }
    const setsVal = document.getElementById('setsInput').value;
    const repsVal = document.getElementById('repsInput').value;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from('sets').insert({
      user_id: userData.user.id,
      exercise_id: exerciseId,
      weight, weight_unit: unit,
      num_sets: setsVal ? parseInt(setsVal,10) : null,
      reps: repsVal ? parseInt(repsVal,10) : null,
      logged_at: new Date().toISOString().slice(0,10)
    });
    if (error){ alert(error.message); return; }
    overlay.remove();
    renderTrack();
  };
}

// ---------- INIT / AUTH STATE ----------
supabase.auth.onAuthStateChange((_event, session) => {
  state.session = session;
  if (session) renderTrack(); else renderLogin();
});

supabase.auth.getSession().then(({ data: { session } }) => {
  state.session = session;
  if (session) renderTrack(); else renderLogin();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js'));
}
