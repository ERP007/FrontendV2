import type { BranchSalesOrderDetailResponse } from './types'

export const MOCK_BRANCH_SALES_ORDER_DETAIL: BranchSalesOrderDetailResponse = {
  approvedAt: '2026-06-12T09:25:00.000Z',
  carrierType: 'VEHICLE',
  code: 'SO-2026-0001',
  fromWarehouse: { code: 'WH-HQ-001', name: '본사 중앙창고' },
  invoiceNumber: 'HMC-44219-026',
  lines: [
    { id: 1, itemCode: 'HMC-EN-00214', itemName: '엔진오일 필터 (2.0L gasoline)', requestQuantity: 80, unit: 'EA' },
    { id: 2, itemCode: 'HMC-BR-01102', itemName: '브레이크 패드 세트 (전륜)', requestQuantity: 40, unit: 'SET' },
    { id: 3, itemCode: 'HMC-EN-10331', itemName: '에어 클리너 카트리지', requestQuantity: 60, unit: 'EA' },
    { id: 4, itemCode: 'HMC-SP-00673', itemName: '스파크 플러그 (이리듐)', requestQuantity: 48, unit: 'EA' },
    { id: 5, itemCode: 'HMC-AC-40229', itemName: '와이퍼 블레이드 24"', requestQuantity: 10, unit: 'EA' },
    { id: 6, itemCode: 'HMC-CL-50710', itemName: '엔진 쿨런트 1L', requestQuantity: 10, unit: 'L' },
  ],
  status: 'APPROVED',
  toWarehouse: { code: 'WH-04A', name: '강남 1지점 · 부품창고' },
}
