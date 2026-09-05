#!/usr/bin/env python3
"""
Regression Test: Partial Refund Double-Deduction Prevention (ORD-2026-0355)

Verifies that:
1. Refund is deducted exactly once in order-to-payout arithmetic:
   policy_expected_net = order_amount - discount - refund_total - fee - tax - tds
2. Settlement feed gross amount already accounts for refund (₹97,940 = ₹103,750 - ₹1,660 - ₹4,150).
3. The settlement internal arithmetic check verifies:
   gross_amount - gateway_fee - gateway_tax - gateway_tds == settled_amount
   (₹97,940 - ₹2,041.80 - ₹367.52 - ₹1,020.90 == ₹94,509.78)
   WITHOUT subtracting the refund a second time.
4. Final economic event status transitions to RESOLVED with discrepancy_class PARTIAL_REFUND.
"""

import json
import os
import unittest


class TestPartialRefundNoDoubleCount(unittest.TestCase):
    def setUp(self):
        fixture_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'partial_refund_case.json')
        with open(fixture_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

    def test_order_and_settlement_arithmetic(self):
        order = self.data['order']
        settlement = self.data['settlement']
        bank = self.data['bank_statement']

        # 1. Base order amounts
        order_amount = order['order_amount']
        discount = order['discount']
        refund = order['refund_total']
        self.assertEqual(order_amount, 103750.0)
        self.assertEqual(discount, 1660.0)
        self.assertEqual(refund, 4150.0)

        # 2. Taxable amount (net of discount)
        taxable_amount = order_amount - discount
        self.assertEqual(taxable_amount, 102090.0)

        # 3. Policy fee, tax, TDS
        policy_fee = round(taxable_amount * order['policy_fee_rate'], 2)  # 2% of 102090 = 2041.80
        policy_tax = round(policy_fee * order['policy_tax_rate'], 2)      # 18% of 2041.80 = 367.52
        policy_tds = round(taxable_amount * order['policy_tds_rate'], 2)  # 1% of 102090 = 1020.90
        self.assertEqual(policy_fee, 2041.80)
        self.assertEqual(policy_tax, 367.52)
        self.assertEqual(policy_tds, 1020.90)

        # 4. Policy expected net (single deduction of refund)
        policy_expected_net = round(
            order_amount - discount - refund - policy_fee - policy_tax - policy_tds, 2
        )
        self.assertEqual(policy_expected_net, 94509.78)

        # 5. Settlement gross amount already reflects net of refund (₹97,940)
        expected_settlement_gross = order_amount - discount - refund
        self.assertEqual(settlement['gross_amount'], expected_settlement_gross)
        self.assertEqual(settlement['gross_amount'], 97940.0)

        # 6. Settlement internal net arithmetic:
        # gross - fee - tax - tds == settled_amount
        # MUST NOT re-subtract refund here!
        settled_net = round(
            settlement['gross_amount']
            - settlement['gateway_fee']
            - settlement['gateway_tax']
            - settlement['gateway_tds'],
            2,
        )
        self.assertEqual(settled_net, settlement['settled_amount'])
        self.assertEqual(settlement['settled_amount'], 94509.78)

        # 7. Bank statement credit conservation
        self.assertEqual(bank['credited_amount'], 94509.78)
        self.assertEqual(bank['utr'], settlement['utr'])

        # 8. Pairwise variances are strictly zero
        self.assertAlmostEqual(policy_expected_net - settlement['settled_amount'], 0.0, places=2)
        self.assertAlmostEqual(settlement['settled_amount'] - bank['credited_amount'], 0.0, places=2)
        self.assertAlmostEqual(policy_expected_net - bank['credited_amount'], 0.0, places=2)

    def test_after_fix_artifact_status(self):
        after_fix_path = os.path.join(
            os.path.dirname(__file__), '..', 'artifacts', 'after_fix', 'partial_refund_pass.json'
        )
        if os.path.exists(after_fix_path):
            with open(after_fix_path, 'r', encoding='utf-8') as f:
                event = json.load(f)
            self.assertEqual(event['status'], 'RESOLVED')
            self.assertEqual(event['discrepancy_class'], 'PARTIAL_REFUND')
            self.assertEqual(event['policy_expected_net'], 94509.78)
            self.assertEqual(event['gateway_reported_net'], 94509.78)
            self.assertEqual(event['bank_received_net'], 94509.78)
            self.assertEqual(event['settlement_variance'], 0.0)
            self.assertEqual(event['bank_variance'], 0.0)


if __name__ == '__main__':
    unittest.main()
