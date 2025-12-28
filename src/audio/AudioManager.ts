/**
 * Audio manager for game sounds and music.
 * Uses Web Audio API for better performance.
 */

export type SoundName = 'shoot' | 'match' | 'chain' | 'win' | 'lose' | 'swap';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundName, AudioBuffer> = new Map();
  private volume: number = 0.5;
  private muted: boolean = false;
  private initialized: boolean = false;

  // Sound URLs (can be base64 encoded or actual file paths)
  private readonly soundUrls: Record<SoundName, string> = {
    shoot: '/assets/sounds/shoot.mp3',
    match: '/assets/sounds/match.mp3',
    chain: '/assets/sounds/chain.mp3',
    win: '/assets/sounds/win.mp3',
    lose: '/assets/sounds/lose.mp3',
    swap: '/assets/sounds/swap.mp3'
  };

  constructor() {
    // Initialize on first user interaction (required for browser audio policy)
    this.setupUserInteractionHandler();
  }

  /**
   * Set up handler to initialize audio on user interaction
   */
  private setupUserInteractionHandler(): void {
    const initAudio = () => {
      if (!this.initialized) {
        this.initialize();
      }
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
  }

  /**
   * Initialize the audio context
   */
  private initialize(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      console.log('AudioManager initialized');

      // Preload sounds
      this.preloadAll();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  /**
   * Preload all game sounds
   */
  async preloadAll(): Promise<void> {
    if (!this.audioContext) return;

    const loadPromises = Object.entries(this.soundUrls).map(async ([name, url]) => {
      try {
        await this.preload(name as SoundName, url);
      } catch (e) {
        // Sound files may not exist, generate synthetic sounds instead
        console.log(`Generating synthetic sound for: ${name}`);
        await this.generateSyntheticSound(name as SoundName);
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Preload a single sound
   */
  async preload(name: SoundName, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (e) {
      throw new Error(`Failed to load sound: ${url}`);
    }
  }

  /**
   * Generate a synthetic sound when audio files aren't available
   */
  private async generateSyntheticSound(name: SoundName): Promise<void> {
    if (!this.audioContext) return;

    const sampleRate = this.audioContext.sampleRate;
    let duration: number;
    let frequency: number;
    let type: OscillatorType = 'sine';

    switch (name) {
      case 'shoot':
        duration = 0.1;
        frequency = 440;
        type = 'square';
        break;
      case 'match':
        duration = 0.3;
        frequency = 880;
        type = 'sine';
        break;
      case 'chain':
        duration = 0.4;
        frequency = 660;
        type = 'triangle';
        break;
      case 'win':
        duration = 0.8;
        frequency = 523.25; // C5
        type = 'sine';
        break;
      case 'lose':
        duration = 0.6;
        frequency = 220;
        type = 'sawtooth';
        break;
      case 'swap':
        duration = 0.1;
        frequency = 330;
        type = 'square';
        break;
      default:
        duration = 0.2;
        frequency = 440;
    }

    // Create offline context to generate the sound
    const offlineContext = new OfflineAudioContext(1, sampleRate * duration, sampleRate);
    const oscillator = offlineContext.createOscillator();
    const gainNode = offlineContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, 0);

    // Create envelope
    gainNode.gain.setValueAtTime(0.5, 0);
    gainNode.gain.exponentialRampToValueAtTime(0.01, duration);

    oscillator.connect(gainNode);
    gainNode.connect(offlineContext.destination);

    oscillator.start(0);
    oscillator.stop(duration);

    const audioBuffer = await offlineContext.startRendering();
    this.sounds.set(name, audioBuffer);
  }

  /**
   * Play a sound
   */
  play(name: SoundName): void {
    if (!this.audioContext || this.muted) return;

    const buffer = this.sounds.get(name);
    if (!buffer) {
      // Sound not loaded yet, try to generate
      this.generateSyntheticSound(name).then(() => {
        this.playBuffer(name);
      });
      return;
    }

    this.playBuffer(name);
  }

  /**
   * Play a buffer
   */
  private playBuffer(name: SoundName): void {
    if (!this.audioContext || this.muted) return;

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Set muted state
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Toggle muted state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }
}
