import { render } from '@testing-library/react';
import { BatchGrid } from './BatchGrid';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

jest.mock('gsap', () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    utils: { selector: jest.fn(() => () => [{}, {}]) },
    matchMedia: jest.fn(() => ({ 
      add: jest.fn((_conditions, callback) => callback({ conditions: { isDesktop: true } })), 
      revert: jest.fn() 
    })),
    set: jest.fn(),
    to: jest.fn(),
  },
  registerPlugin: jest.fn(),
}));

jest.mock('gsap/ScrollTrigger', () => ({
  __esModule: true,
  ScrollTrigger: {
    batch: jest.fn(),
    refresh: jest.fn(),
  },
}));

describe('BatchGrid', () => {
  const mockedRegisterPlugin = gsap.registerPlugin as unknown as jest.Mock;
  const mockedBatch = ScrollTrigger.batch as unknown as jest.Mock;

  it('should initialize GSAP and ScrollTrigger on mount', () => {
    render(
      <BatchGrid>
        <div className="batch-item">Item</div>
        <div className="batch-item">Item</div>
      </BatchGrid>
    );

    expect(mockedRegisterPlugin).toHaveBeenCalled();
    expect(mockedBatch).toHaveBeenCalled();
  });
});