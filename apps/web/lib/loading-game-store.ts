type Listener = (show: boolean) => void;

class LoadingGameStore {
  private listeners = new Set<Listener>();
  private pendingCount = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private _show = false;

  get show() {
    return this._show;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(show: boolean) {
    this._show = show;
    this.listeners.forEach((fn) => fn(show));
  }

  requestStarted() {
    this.pendingCount++;
    if (this.pendingCount === 1 && !this.timer && !this._show) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.emit(true);
      }, 5000);
    }
  }

  requestEnded() {
    this.pendingCount = Math.max(0, this.pendingCount - 1);
    if (this.pendingCount === 0) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this._show) {
        this.emit(false);
      }
    }
  }
}

export const loadingGameStore = new LoadingGameStore();
