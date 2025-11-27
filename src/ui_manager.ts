export class UIManager {
  private hud: HTMLElement;
  private sensInput!: HTMLInputElement;
  private sensVal!: HTMLElement;

  public mainMenu!: HTMLElement;
  public settingsMenu!: HTMLElement;
  public returnBtn!: HTMLElement;
  public changeLevelBtn!: HTMLElement;
  public settingsBtn!: HTMLElement;
  public visualsBtn!: HTMLElement;
  public backBtn!: HTMLElement;

  public onResume: (() => void) | null = null;

  constructor(defaultSensitivity: number) {
    // --- HUD ---
    this.hud = document.createElement('div');
    this.hud.className = 'hud';
    document.body.appendChild(this.hud);

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
      '<button id="btn-level" class="menu-btn">Change Level</button>' +
      '<button id="btn-settings" class="menu-btn">Settings</button>' +
      '<button id="btn-visuals" class="menu-btn">Visuals</button>';

    menu.addEventListener('click', (e) => e.stopPropagation());
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    this.returnBtn = menu.querySelector('#btn-return') as HTMLElement;
    this.changeLevelBtn = menu.querySelector('#btn-level') as HTMLElement;
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
      '<button id="btn-back" class="menu-btn" style="margin-top: 20px;">Back</button>';

    menu.addEventListener('click', (e) => e.stopPropagation());
    menu.addEventListener('mousedown', (e) => e.stopPropagation());

    this.backBtn = menu.querySelector('#btn-back') as HTMLElement;
    this.sensInput = menu.querySelector('#sens') as HTMLInputElement;
    this.sensVal = menu.querySelector('#sens-val') as HTMLElement;

    return menu;
  }

  private setupEventListeners() {
    this.returnBtn.addEventListener('click', () => {
      if (this.onResume) this.onResume();
    });

    this.settingsBtn.addEventListener('click', () => {
      this.toggleSettings(true);
    });

    this.backBtn.addEventListener('click', () => {
      this.toggleSettings(false);
    });

    this.changeLevelBtn.addEventListener('click', () => console.log('Change Level: Not implemented'));
    this.visualsBtn.addEventListener('click', () => console.log('Visuals: Not implemented'));
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
    const color = speed > 20 ? '#f33' : speed > 12 ? '#ff3' : '#fff';
    this.hud.innerHTML = 'FPS:   ' + fps + '\nSpeed: <span style="color:' + color + '">' + speed.toFixed(2) + '</span> u/s';
  }
}
