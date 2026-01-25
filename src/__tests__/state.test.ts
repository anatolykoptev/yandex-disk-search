import { describe, it, expect, beforeEach } from 'vitest';
import { StateManager } from '../services/state';

describe('StateManager', () => {
  let state: StateManager;

  beforeEach(() => {
    state = new StateManager();
  });

  describe('addItem', () => {
    it('should add new item and return true', () => {
      const result = state.addItem('file1.txt');
      expect(result).toBe(true);
      expect(state.size).toBe(1);
    });

    it('should not add duplicate item and return false', () => {
      state.addItem('file1.txt');
      const result = state.addItem('file1.txt');
      expect(result).toBe(false);
      expect(state.size).toBe(1);
    });

    it('should not add empty string', () => {
      const result = state.addItem('');
      expect(result).toBe(false);
      expect(state.size).toBe(0);
    });

    it('should handle cyrillic names', () => {
      state.addItem('документ.pdf');
      state.addItem('фото.jpg');
      expect(state.size).toBe(2);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      state.addItem('document.pdf');
      state.addItem('photo.jpg');
      state.addItem('report.pdf');
      state.addItem('UPPERCASE.TXT');
    });

    it('should return all items when query is empty', () => {
      const result = state.search('');
      expect(result.matches).toBe(4);
      expect(result.total).toBe(4);
      expect(result.query).toBe('');
    });

    it('should find items by partial match', () => {
      const result = state.search('pdf');
      expect(result.matches).toBe(2);
      expect(result.total).toBe(4);
    });

    it('should be case-insensitive', () => {
      const result = state.search('PDF');
      expect(result.matches).toBe(2);
    });

    it('should find uppercase files with lowercase query', () => {
      const result = state.search('uppercase');
      expect(result.matches).toBe(1);
    });

    it('should trim whitespace from query', () => {
      const result = state.search('  pdf  ');
      expect(result.matches).toBe(2);
    });

    it('should update currentQuery', () => {
      state.search('photo');
      expect(state.currentQuery).toBe('photo');
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      state.addItem('file.txt');
      state.isLoading = true;
      state.isLoaded = true;
      state.currentQuery = 'test';

      state.reset();

      expect(state.size).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.isLoaded).toBe(false);
      expect(state.currentQuery).toBe('');
    });
  });

  describe('loading state', () => {
    it('should track isLoading', () => {
      expect(state.isLoading).toBe(false);
      state.isLoading = true;
      expect(state.isLoading).toBe(true);
    });

    it('should track isLoaded', () => {
      expect(state.isLoaded).toBe(false);
      state.isLoaded = true;
      expect(state.isLoaded).toBe(true);
    });
  });
});
