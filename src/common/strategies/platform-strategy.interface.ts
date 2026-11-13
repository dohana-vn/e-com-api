import {
  PrintEligibilityOptions,
  PrintEligibilityResult,
  PrintSource,
  PrintableOrderCandidate,
} from '../shipping-print.helper';
import {
  UnifiedPrintRequest,
  UnifiedPrintResult,
} from '../shipping-print.client';

/**
 * Common contract that every e-commerce platform print strategy must fulfill.
 * Enforces the Open/Closed Principle (OCP): new platforms can be added
 * without modifying existing strategies or callers.
 */
export interface PlatformPrintStrategy<
  TReq extends UnifiedPrintRequest = UnifiedPrintRequest,
  TRes extends UnifiedPrintResult = UnifiedPrintResult,
> {
  /** The platform identifier (e.g. 'TIKTOK', 'SHOPEE', 'NHANH', 'LAZADA') */
  readonly source: PrintSource | string;

  /** Check whether an order from this platform is eligible to print */
  isPrintable(
    order: PrintableOrderCandidate,
    options?: PrintEligibilityOptions,
  ): PrintEligibilityResult;

  /** Execute platform printing and return unified result */
  print(request: TReq): Promise<TRes>;
}
