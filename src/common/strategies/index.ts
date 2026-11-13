import { PlatformPrintStrategy } from './platform-strategy.interface';
import { TiktokPrintStrategy } from './tiktok.strategy';
import { ShopeePrintStrategy } from './shopee.strategy';
import { NhanhPrintStrategy } from './nhanh.strategy';
import {
  PrintEligibilityOptions,
  PrintEligibilityResult,
  PrintableOrderCandidate,
} from '../shipping-print.helper';
import {
  UnifiedPrintRequest,
  UnifiedPrintResult,
} from '../shipping-print.client';

export * from './platform-strategy.interface';
export * from './tiktok.strategy';
export * from './shopee.strategy';
export * from './nhanh.strategy';

/**
 * Strategy Registry for e-commerce shipping label printing.
 * Implements the Open/Closed Principle (OCP):
 * To add a new platform (e.g. Lazada, Tiki), create a new strategy class
 * implementing PlatformPrintStrategy and call `registry.register(new LazadaPrintStrategy())`.
 * Existing platforms and caller code remain 100% untouched.
 */
export class ShippingPrintRegistry {
  private readonly strategies = new Map<string, PlatformPrintStrategy>();

  constructor() {
    // Pre-register default core platform strategies
    this.register(new TiktokPrintStrategy());
    this.register(new ShopeePrintStrategy());
    this.register(new NhanhPrintStrategy());
  }

  /**
   * Register a new platform strategy or override an existing one.
   */
  public register(strategy: PlatformPrintStrategy): this {
    this.strategies.set(String(strategy.source).toUpperCase(), strategy);
    return this;
  }

  /**
   * Retrieve a strategy by platform source name.
   */
  public get(source: string): PlatformPrintStrategy | undefined {
    return this.strategies.get(String(source).toUpperCase());
  }

  /**
   * Check if a strategy is registered for the platform source.
   */
  public has(source: string): boolean {
    return this.strategies.has(String(source).toUpperCase());
  }

  /**
   * List all registered strategy platform names.
   */
  public getSupportedPlatforms(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Centralized method to check order print eligibility across registered strategies.
   */
  public isOrderPrintable(
    order: PrintableOrderCandidate,
    options?: PrintEligibilityOptions,
  ): PrintEligibilityResult {
    const strategy = this.get(order.source);
    if (!strategy) {
      return {
        printable: false,
        reason: `Unsupported platform source: ${order.source}. Supported platforms: ${this.getSupportedPlatforms().join(', ')}`,
      };
    }
    return strategy.isPrintable(order, options);
  }

  /**
   * Centralized method to execute print document retrieval across registered strategies.
   */
  public async getShippingPrintDocument(
    request: UnifiedPrintRequest,
  ): Promise<UnifiedPrintResult> {
    const strategy = this.get(request.source);
    if (!strategy) {
      throw new Error(
        `Unsupported platform source: ${request.source}. Supported platforms: ${this.getSupportedPlatforms().join(', ')}`,
      );
    }
    return strategy.print(request);
  }
}

/** Global singleton instance of the shipping print strategy registry */
export const defaultShippingPrintRegistry = new ShippingPrintRegistry();
