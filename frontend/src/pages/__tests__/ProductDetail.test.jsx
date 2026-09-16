import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProductDetail from '../ProductDetail'

const { getMock, addToCart, toggleWishlist, notify } = vi.hoisted(() => ({
  getMock: vi.fn(),
  addToCart: vi.fn(),
  toggleWishlist: vi.fn(),
  notify: vi.fn(),
}))

vi.mock('../../api', () => ({
  get: (...args) => getMock(...args),
  formatRands: (cents) => `R ${(Number(cents) / 100).toFixed(2)}`,
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

vi.mock('../../components/ProductCard', () => ({
  default: ({ product }) => <div data-testid="related-product">{product.name}</div>,
}))

describe('ProductDetail page', () => {
  const product = {
    _id: 'p1',
    sku: 'MOUSE-1',
    name: 'Wireless Mouse',
    description: 'A comfortable wireless mouse.',
    price_cents: 49999,
    stock_quantity: 10,
    category_id: { _id: 'cat-1', name: 'Accessories' },
    images: [
      { image_url: '/mouse-front.jpg', is_primary: true },
      { image_url: '/mouse-side.jpg', is_primary: false },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getMock.mockImplementation((path) => {
      if (path === '/api/products/MOUSE-1') return Promise.resolve({ product })
      return Promise.resolve({ products: [] })
    })
  })

  const renderPage = () => render(
    <MemoryRouter initialEntries={['/products/MOUSE-1']}>
      <Routes>
        <Route path="/products/:sku" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>,
  )

  it('renders product details and image gallery from the API', async () => {
    renderPage()
    
    expect(await screen.findByRole('heading', { name: 'Wireless Mouse' })).toBeInTheDocument()
    expect(screen.getByText('A comfortable wireless mouse.')).toBeInTheDocument()
    expect(screen.getByText('SKU MOUSE-1')).toBeInTheDocument()
    const images = screen.getAllByRole('img', { name: 'Wireless Mouse' })
    expect(images[0]).toHaveAttribute('src', '/mouse-front.jpg')
    expect(screen.getByRole('button', { name: 'Show image 2' })).toBeInTheDocument()
  })

  it('changes the main image when a thumbnail is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: 'Wireless Mouse' })
    await user.click(screen.getAllByRole('button', { name: 'Show image 2' })[0])

    const images = screen.getAllByRole('img', { name: 'Wireless Mouse' })
    expect(images[0]).toHaveAttribute('src', '/mouse-side.jpg')
  })

  it('adds the selected quantity to the bag when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByRole('heading', { name: 'Wireless Mouse' })[0]
    await user.click(screen.getAllByRole('button', { name: 'Add to bag' })[0])

    expect(addToCart).toHaveBeenCalledWith(product, 1)
  })
})
