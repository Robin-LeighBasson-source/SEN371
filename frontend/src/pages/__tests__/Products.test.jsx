import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Products from '../Products'

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }))

vi.mock('../../api', () => ({
  get: (...args) => getMock(...args),
}))

vi.mock('../../components/ProductCard', () => ({
  default: ({ product }) => <article data-testid="product-card">{product.name}</article>,
  ProductCardSkeleton: () => <div data-testid="product-skeleton" />,
}))

describe('Products page', () => {
  const categories = [
    { _id: 'cat-1', name: 'Accessories' },
    { _id: 'cat-2', name: 'Audio' },
  ]

  const products = [
    { _id: 'p1', sku: 'MOUSE-1', name: 'Wireless Mouse', price_cents: 49999 },
    { _id: 'p2', sku: 'HEAD-1', name: 'Wireless Headphones', price_cents: 99999 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    getMock.mockImplementation((path) => {
      if (path === '/api/categories') return Promise.resolve({ categories })
      return Promise.resolve({
        products,
        pagination: { page: 1, pages: 2, total: 14 },
      })
    })
  })

  it('renders product cards after receiving API data', async () => {
    render(<Products />, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> })

    expect(await screen.findByText('Wireless Mouse')).toBeInTheDocument()
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('14 items')).toBeInTheDocument()
    expect(getMock).toHaveBeenCalledWith('/api/categories')
    expect(getMock).toHaveBeenCalledWith(expect.stringContaining('/api/products?page=1&limit=12'), expect.any(AbortSignal))
  })

  it('requests products for the selected category', async () => {
    const user = userEvent.setup()
    render(<Products />, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> })

    await screen.findByText('Wireless Mouse')
    await user.click(screen.getByRole('button', { name: /Accessories/ }))

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith(expect.stringContaining('category_id=cat-1'), expect.any(AbortSignal))
    })
  })

  it('changes page when the pagination button is clicked', async () => {
    const user = userEvent.setup()
    render(<Products />, { wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter> })

    await screen.findByText('Wireless Mouse')
    await user.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith(expect.stringContaining('/api/products?page=2&limit=12'), expect.any(AbortSignal))
    })
  })
})
