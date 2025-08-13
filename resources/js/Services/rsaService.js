import forge from 'node-forge';

const rsaService = {
  _cachedPublicKey: null,
  _isFetching: false,
  _pendingQueue: [],

  async getPublicKey() {
    // Return cached key if available
    if (this._cachedPublicKey) {
      return this._cachedPublicKey;
    }

    // If a request is already in progress, queue the promise
    if (this._isFetching) {
      return new Promise((resolve) => {
        this._pendingQueue.push(resolve);
      });
    }

    // Fetch the key if not cached
    this._isFetching = true;
    try {
      const pemPublicKey = await fetch('/public-key').then((res) => res.text());
      this._cachedPublicKey = forge.pki.publicKeyFromPem(pemPublicKey);
      this._isFetching = false;
      
      // Resolve all queued promises
      this._pendingQueue.forEach(resolve => resolve(this._cachedPublicKey));
      this._pendingQueue = [];
      
      return this._cachedPublicKey;
    } catch (err) {
      this._isFetching = false;
      this._pendingQueue = [];
      throw err;
    }
  },

  async encrypt(text) {
    try {
      const publicKey = await this.getPublicKey();
      const encrypted = publicKey.encrypt(text, 'RSA-OAEP');
      return forge.util.encode64(encrypted);
    } catch (err) {
      console.error('Encryption failed:', err);
      throw err;
    }
  },
};

export default rsaService;
