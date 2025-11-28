export class UIManager {
  private hud: HTMLElement;
  private hudFps!: HTMLElement;
  private hudSpeed!: HTMLElement;
  private sensInput!: HTMLInputElement;
  private sensVal!: HTMLElement;

  public mainMenu!: HTMLElement;
  public settingsMenu!: HTMLElement;

  public returnBtn!: HTMLElement;
  public settingsBtn!: HTMLElement;
  public leaderboardBtn!: HTMLElement;
  public visualsBtn!: HTMLElement;

  public settingsBackBtn!: HTMLElement;

  public onResume: (() => void) | null = null;
  public onLoadLevel: ((type: 'playground' | 'infinite') => void) | null = null;

  private lastUpdate: number = 0;

  constructor(defaultSensitivity: number) {
    // --- HUD ---
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    this.hud.innerHTML = 'FPS: <span id="hud-fps">0</span><br>Speed: <span id="hud-speed">0.00</span> u/s';
    document.body.appendChild(this.hud);

    this.hudFps = this.hud.querySelector('#hud-fps') as HTMLElement;
    this.hudSpeed = this.hud.querySelector('#hud-speed') as HTMLElement;

    // --- MENUS ---
    this.mainMenu = this.createMainMenu();
    this.settingsMenu = this.createSettingsMenu(defaultSensitivity);
    document.body.appendChild(this.mainMenu);
    document.body.appendChild(this.settingsMenu);

    // --- CROSSHAIR ---
    const crosshair = document.createElement('div');
    crosshair.id = 'crosshair';
    document.body.appendChild(crosshair);

    this.setupEventListeners();
  }

  private createMainMenu(): HTMLElement {
    const menu = document.createElement('div');
    menu.id = 'game-menu';
    menu.className = 'menu-overlay hidden';

    menu.innerHTML =
      '<h1 class="menu-title">Infinite Jumps</h1>' +
      '<button id="btn-return" class="menu-btn">Return</button>' +
      '<button id="btn-leaderboard" class="menu-btn">Leaderboard</button>' +
      '<button id="btn-settings" class="menu-btn">Settings</button>' +
      '<button id="btn-visuals" class="menu-btn">Visuals</button>';

    menu.addEventListener('click', (e) => e.stopPropagation());
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    this.returnBtn = menu.querySelector('#btn-return') as HTMLElement;
    this.leaderboardBtn = menu.querySelector('#btn-leaderboard') as HTMLElement;
    this.settingsBtn = menu.querySelector('#btn-settings') as HTMLElement;
    this.visualsBtn = menu.querySelector('#btn-visuals') as HTMLElement;

    return menu;
  }

  private createSettingsMenu(defaultSensitivity: number): HTMLElement {
    const menu = document.createElement('div');
    menu.id = 'settings-menu';
    menu.className = 'menu-overlay hidden';

    menu.innerHTML =
      '<h1 class="menu-title">Settings</h1>' +
      '<div class="setting-row">' +
      '<label>Sensitivity</label>' +
      '<input type="range" id="sens" min="0.1" max="10.0" step="0.05" value="' + defaultSensitivity + '">' +
      '<span id="sens-val">' + defaultSensitivity + '</span>' +
      '</div>' +
      '<button id="btn-settings-back" class="menu-btn" style="margin-top: 20px;">Back</button>';

    menu.addEventListener('click', (e) => e.stopPropagation());
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    this.settingsBackBtn = menu.querySelector('#btn-settings-back') as HTMLElement;
    this.sensInput = menu.querySelector('#sens') as HTMLInputElement;
    this.sensVal = menu.querySelector('#sens-val') as HTMLElement;

    return menu;
  }

  private setupEventListeners() {
    this.returnBtn.addEventListener('click', () => {
      if (this.onResume) this.onResume();
    });

    this.leaderboardBtn.addEventListener('click', () => console.log('Leaderboard: Not implemented'));
    this.settingsBtn.addEventListener('click', () => this.toggleSettings(true));
    this.visualsBtn.addEventListener('click', () => console.log('Visuals: Not implemented'));
    this.settingsBackBtn.addEventListener('click', () => this.toggleSettings(false));
  }

  public toggleMenu(isOpen: boolean) {
    if (isOpen) {
      this.mainMenu.classList.remove('hidden');
      this.settingsMenu.classList.add('hidden');
      this.hud.style.display = 'none';
      document.exitPointerLock();
    } else {
      this.mainMenu.classList.add('hidden');
      this.settingsMenu.classList.add('hidden');
      this.hud.style.display = 'block';
    }
  }

  public toggleSettings(isOpen: boolean) {
    if (isOpen) {
      this.mainMenu.classList.add('hidden');
      this.settingsMenu.classList.remove('hidden');
    } else {
      this.mainMenu.classList.remove('hidden');
      this.settingsMenu.classList.add('hidden');
    }
  }

  public onSensitivityChange(callback: (val: number) => void) {
    if (this.sensInput) {
      this.sensInput.addEventListener('input', (e) => {
        const val = parseFloat((e.target as HTMLInputElement).value);
        this.sensVal.innerText = val.toFixed(2);
        callback(val);
      });
    }
  }

  public update(fps: number, speed: number) {
    if (performance.now() - this.lastUpdate < 50) return;
    this.lastUpdate = performance.now();

    const color = speed > 20 ? '#f33' : speed > 12 ? '#ff3' : '#fff';
    this.hudFps.textContent = fps.toString();
    this.hudSpeed.textContent = speed.toFixed(2);
    this.hudSpeed.style.color = color;
  }
}
