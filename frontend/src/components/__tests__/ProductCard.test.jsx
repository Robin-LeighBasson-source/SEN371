import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProductCard from '../ProductCard'

const { addToCart, toggleWishlist, notify } = vi.hoisted(() => ({
  addToCart: vi.fn(),
  toggleWishlist: vi.fn(),
  notify: vi.fn(),
}))

vi.mock('../../context/useStore', () => ({
  useStore: () => ({
    isAuthed: true,
    addToCart,
    toggleWishlist,
    wishlistIds: new Set(),
    notify,
  }),
}))

vi.mock('../../api', () => ({
  formatRands: (cents) => `R ${(Number(cents) / 100).toFixed(2)}`,
  primaryImage: (product) => product.images?.[0]?.image_url || '',
  productPath: (product) => `/products/${product.sku}`,
}))

describe('ProductCard', () => {
  const product = {
    _id: 'p1',
    sku: 'TEST-001',
    name: 'Test Wireless Mouse',
    price_cents: 49999,
    stock_quantity: 8,
    category_id: { name: 'Accessories' },
    images: [{ image_url: '/mouse.jpg', is_primary: true }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders product information and image', () => {
    render(<ProductCard product={product} />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { name: 'Test Wireless Mouse' })).toBeInTheDocument()
    expect(screen.getByText('Accessories')).toBeInTheDocument()
    expect(screen.getByText('R 499.99')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Test Wireless Mouse' })).toHaveAttribute('src', '/mouse.jpg')
  })

  it('adds an in-stock product when the bag button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={product} />, { wrapper: MemoryRouter })

    await user.click(screen.getAllByRole('button', { name: 'Add Test Wireless Mouse to bag' })[0])

    expect(addToCart).toHaveBeenCalledWith(product, 1)
  })

  it('disables the bag button for an out-of-stock product', () => {
    render(<ProductCard product={{ ...product, stock_quantity: 0 }} />, { wrapper: MemoryRouter })

    expect(screen.getByRole('button', { name: 'Sold out' })).toBeDisabled()
    expect(screen.getByText('Sold out')).toBeInTheDocument()
  })

  it('toggles the wishlist when save for later is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={product} />, { wrapper: MemoryRouter })

    await user.click(screen.getAllByRole('button', { name: 'Save for later' })[0])

    expect(toggleWishlist).toHaveBeenCalledWith(product)
  })
})
