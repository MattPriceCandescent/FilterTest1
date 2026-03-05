import { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import catalogProducts from '../data/catalog-products.json';
import './Catalog.css';

const BASE = import.meta.env.BASE_URL;
function assetUrl(path) {
  if (!path) return path;
  return BASE.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function NothingFoundSvg({ className }) {
  return (
    <svg className={className} width="124" height="94" viewBox="0 0 124 94" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M41.7529 80.9153C26.8688 65.7765 27.2285 41.092 36.1962 40.8384C45.1639 40.5847 52.6547 59.9933 46.971 81.9299L41.7529 80.9153V80.9153Z" fill="#CFEFD8"/>
      <path d="M21.4688 62.5719C16.8136 65.9539 25.5866 79.1523 38.9599 81.7733L42.0916 80.4205C37.1359 66.7487 26.1241 59.1899 21.4646 62.5719H21.4688Z" fill="#CFEFD8"/>
      <path d="M95.9951 81.5537C87.2983 81.4776 60.3443 81.1394 43.9874 80.1587C13.6562 78.3408 -11.114 81.3424 5.15824 84.7751C9.7077 85.7348 -3.40745 91.4842 28.6969 92.782C56.8782 93.9235 85.6097 91.4884 99.512 90.44C113.419 89.3916 119.83 87.5357 122.809 86.6986C125.429 85.963 126.394 81.8243 95.9909 81.5537H95.9951Z" fill="#F5F5F5"/>
      <path d="M28.8615 46.0467C24.0454 40.2931 21.7559 33.0218 22.4203 25.5686C23.0848 18.0986 26.627 11.3303 32.4037 6.51943C38.1636 1.72965 45.43 -0.544759 52.87 0.110507C68.2874 1.48022 79.7266 15.1224 78.3554 30.5275C77.691 38.006 74.1361 44.7743 68.3593 49.5894C62.6079 54.3792 55.3457 56.6494 47.9058 55.9941C40.4447 55.3304 33.6818 51.8004 28.8657 46.0467H28.8615ZM64.9906 45.5648C69.7009 41.6417 72.5829 36.1374 73.1246 30.0625C74.2419 17.5321 64.9483 6.4391 52.4045 5.33149C46.3526 4.7946 40.4447 6.64203 35.7682 10.544C31.0622 14.4629 28.1802 19.9629 27.6384 26.0294C27.101 32.0959 28.9589 38.006 32.8862 42.6859C36.8009 47.3615 42.3068 50.2362 48.3671 50.7773C54.4104 51.3142 60.3184 49.4626 64.9906 45.5648Z" fill="#C3D3E4"/>
      <path opacity="0.31" d="M74.424 30.1765C75.6047 16.9317 65.7779 5.20457 52.5231 4.03777C46.1242 3.47551 39.8819 5.42862 34.9389 9.54623C29.9662 13.6892 26.9191 19.502 26.3436 25.9152L23.999 25.708C23.999 25.708 24.0033 25.6742 24.0033 25.6573C24.6381 18.6269 27.9814 12.2645 33.4238 7.73685C38.8451 3.2134 45.7053 1.07005 52.722 1.6915C67.2676 2.98089 78.0551 15.8495 76.7643 30.3837L74.4155 30.1808L74.424 30.1765Z" fill="#F5F5F5"/>
      <path d="M74.9052 49.936L67.646 56.0078C67.2223 56.3622 67.1665 56.9925 67.5213 57.4158L91.0202 85.4503C91.375 85.8735 92.0061 85.9294 92.4297 85.5751L99.689 79.5033C100.113 79.149 100.168 78.5186 99.8136 78.0953L76.3147 50.0608C75.9599 49.6376 75.3289 49.5817 74.9052 49.936Z" fill="#D5ECFC"/>
    </svg>
  );
}

function SearchIconSvg({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function GridViewIconSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 18H6.5V15.5H4V18ZM4 13.25H6.5V10.75H4V13.25ZM4 8.5H6.5V6H4V8.5ZM17.5 6V8.5H20V6H17.5ZM13 8.5H15.5V6H13V8.5ZM17.5 18H20V15.5H17.5V18ZM17.5 13.25H20V10.75H17.5V13.25ZM8.5 18H11V15.5H8.5V18ZM13 18H15.5V15.5H13V18ZM8.5 8.5H11V6H8.5V8.5ZM13 13.25H15.5V10.75H13V13.25ZM8.5 13.25H11V10.75H8.5V13.25Z" fill="currentColor" />
    </svg>
  );
}

function WideViewIconSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 8H3V4H21V8ZM21 10H3V14H21V10ZM21 16H3V20H21V16Z" fill="currentColor" />
    </svg>
  );
}

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'provider', label: 'Provider' },
  { value: 'integrationType', label: 'Integration type' },
  { value: 'timeline', label: 'Timeline' },
];

function deriveStatus(product) {
  return product.timeline && product.timeline.toLowerCase().includes('month')
    ? 'Coming soon'
    : 'Available';
}

function getAllTags(products) {
  const set = new Set();
  products.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

function getAllIntegrationTypes(products) {
  const set = new Set();
  products.forEach((p) => {
    if (p.integrationType && p.integrationType !== '—') set.add(p.integrationType);
  });
  return Array.from(set).sort();
}

function extractDominantColor(imgEl) {
  try {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (a < 128) continue;
      if (r > 230 && g > 230 && b > 230) continue; // near-white
      if (r < 20 && g < 20 && b < 20) continue;    // near-black
      // skip near-grays (anti-aliasing, desaturated pixels)
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (chroma < 40) continue;
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      const key = `${qr},${qg},${qb}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    let best = null, bestCount = 0;
    for (const [key, count] of Object.entries(buckets)) {
      if (count > bestCount) { bestCount = count; best = key; }
    }
    if (!best) return null;
    const [r, g, b] = best.split(',').map(Number);
    return { r, g, b };
  } catch {
    return null;
  }
}

function getCardVariant(productId) {
  const hash = (productId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 5;
}

function buildGradientBackground(r, g, b, variant) {
  const c = (a) => `rgba(${r}, ${g}, ${b}, ${a})`;

  switch (variant) {
    case 0: // Diagonal sweep
      return `linear-gradient(135deg, ${c(0.06)} 0%, ${c(0.16)} 100%)`;
    case 1: // Radial center glow
      return `radial-gradient(circle at 50% 50%, ${c(0.18)} 0%, ${c(0.06)} 100%)`;
    case 2: // Top-down fade
      return `linear-gradient(180deg, ${c(0.16)} 0%, ${c(0.05)} 100%)`;
    case 3: // Corner bloom
      return `radial-gradient(circle at 15% 85%, ${c(0.18)} 0%, ${c(0.05)} 70%)`;
    case 4: // Double-wave
      return `linear-gradient(135deg, ${c(0.08)} 0%, ${c(0.16)} 50%, ${c(0.08)} 100%)`;
    default:
      return `linear-gradient(135deg, ${c(0.06)} 0%, ${c(0.16)} 100%)`;
  }
}

function ProductLogo({ name, logoPath, onColorExtracted, id }) {
  const initials = (name || '')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  if (logoPath) {
    return (
      <img
        id={id}
        src={assetUrl(logoPath)}
        alt=""
        className="product-logo product-logo-img"
        loading="lazy"
        onLoad={(e) => {
          if (onColorExtracted) {
            const color = extractDominantColor(e.currentTarget);
            onColorExtracted(color);
          }
        }}
      />
    );
  }
  return (
    <div id={id} className="product-logo" title={name}>
      {initials}
    </div>
  );
}

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Available' | 'Coming soon'
  const [logoColors, setLogoColors] = useState({});
  const [heroColors, setHeroColors] = useState({});
  const FALLBACK_COLOR = { r: 26, g: 108, b: 218 }; // #1A6CDA — for B&W or unextractable logos
  const handleColorExtracted = useCallback((productId, color) => {
    setLogoColors((prev) => ({ ...prev, [productId]: color ?? FALLBACK_COLOR }));
  }, []);
  const handleHeroColorExtracted = useCallback((productId, color) => {
    if (color) setHeroColors((prev) => ({ ...prev, [productId]: color }));
  }, []);
  const [integrationTypes, setIntegrationTypes] = useState([]); // selected integration types
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'grid-dense'
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [chipsMoreOpen, setChipsMoreOpen] = useState(false);
  const [visibleChipCount, setVisibleChipCount] = useState(999);
  const [chipsResizeKey, setChipsResizeKey] = useState(0);
  const chipsRowRef = useRef(null);
  const chipsRulerRef = useRef(null);
  const chipsMoreRef = useRef(null);
  const chipsMoreButtonRef = useRef(null);
  const stickyHeaderRef = useRef(null);
  const catalogPageRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [titleCollapsed, setTitleCollapsed] = useState(false);

  const productsWithStatus = useMemo(
    () =>
      catalogProducts.map((p) => ({
        ...p,
        status: deriveStatus(p),
      })),
    []
  );

  const allTags = useMemo(() => getAllTags(productsWithStatus), [productsWithStatus]);
  const allIntegrationTypes = useMemo(
    () => getAllIntegrationTypes(productsWithStatus),
    [productsWithStatus]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return productsWithStatus.filter((product) => {
      if (q) {
        const matchName = product.name?.toLowerCase().includes(q);
        const matchProvider = product.provider?.toLowerCase().includes(q);
        const matchTags = (product.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchProvider && !matchTags) return false;
      }
      if (statusFilter !== 'all' && product.status !== statusFilter) return false;
      if (integrationTypes.length > 0 && !integrationTypes.includes(product.integrationType))
        return false;
      if (selectedTags.length > 0) {
        const productTags = product.tags || [];
        const hasMatch = selectedTags.some((tag) => productTags.includes(tag));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [productsWithStatus, searchQuery, statusFilter, integrationTypes, selectedTags]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'name-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'provider':
        list.sort((a, b) => (a.provider || '').localeCompare(b.provider || ''));
        break;
      case 'integrationType':
        list.sort((a, b) =>
          (a.integrationType || '').localeCompare(b.integrationType || '')
        );
        break;
      case 'timeline':
        list.sort((a, b) => (a.timeline || '').localeCompare(b.timeline || ''));
        break;
      default:
        break;
    }
    return list;
  }, [filteredProducts, sortBy]);

  const totalFiltered = sortedProducts.length;
  const displayProducts = sortedProducts;

  // Counts for "how many products visible if this filter option is selected"
  const statusCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseFilter = (p) => {
      if (q) {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchProvider = p.provider?.toLowerCase().includes(q);
        const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchProvider && !matchTags) return false;
      }
      if (integrationTypes.length > 0 && !integrationTypes.includes(p.integrationType)) return false;
      if (selectedTags.length > 0) {
        const hasMatch = selectedTags.some((tag) => (p.tags || []).includes(tag));
        if (!hasMatch) return false;
      }
      return true;
    };
    const withStatus = productsWithStatus.filter(baseFilter);
    return {
      all: withStatus.length,
      Available: withStatus.filter((p) => deriveStatus(p) === 'Available').length,
      'Coming soon': withStatus.filter((p) => deriveStatus(p) === 'Coming soon').length,
    };
  }, [productsWithStatus, searchQuery, integrationTypes, selectedTags]);

  const integrationTypeCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseFilter = (p) => {
      if (q) {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchProvider = p.provider?.toLowerCase().includes(q);
        const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchProvider && !matchTags) return false;
      }
      if (statusFilter !== 'all' && deriveStatus(p) !== statusFilter) return false;
      if (selectedTags.length > 0) {
        const hasMatch = selectedTags.some((tag) => (p.tags || []).includes(tag));
        if (!hasMatch) return false;
      }
      return true;
    };
    const matching = productsWithStatus.filter(baseFilter);
    const counts = {};
    allIntegrationTypes.forEach((type) => {
      // Unselected: how many would show if selected. Selected: use current visible count (set below).
      counts[type] = matching.filter((p) => p.integrationType === type).length;
    });
    return counts;
  }, [productsWithStatus, searchQuery, statusFilter, selectedTags, allIntegrationTypes]);

  const tagCounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const baseFilter = (p) => {
      if (q) {
        const matchName = p.name?.toLowerCase().includes(q);
        const matchProvider = p.provider?.toLowerCase().includes(q);
        const matchTags = (p.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchProvider && !matchTags) return false;
      }
      if (statusFilter !== 'all' && deriveStatus(p) !== statusFilter) return false;
      if (integrationTypes.length > 0 && !integrationTypes.includes(p.integrationType)) return false;
      return true;
    };
    const matching = productsWithStatus.filter(baseFilter);
    const counts = {};
    allTags.forEach((tag) => {
      // Unselected: how many would show if selected. Selected: use current visible count (set below).
      counts[tag] = matching.filter((p) => (p.tags || []).includes(tag)).length;
    });
    return counts;
  }, [productsWithStatus, searchQuery, statusFilter, integrationTypes, allTags]);

  // For selected filters: how many of the current result set this filter contributes (has this tag/type)
  const tagContributionCounts = useMemo(() => {
    const counts = {};
    allTags.forEach((tag) => {
      counts[tag] = filteredProducts.filter((p) => (p.tags || []).includes(tag)).length;
    });
    return counts;
  }, [filteredProducts, allTags]);

  const integrationTypeContributionCounts = useMemo(() => {
    const counts = {};
    allIntegrationTypes.forEach((type) => {
      counts[type] = filteredProducts.filter((p) => p.integrationType === type).length;
    });
    return counts;
  }, [filteredProducts, allIntegrationTypes]);

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) + integrationTypes.length;

  const toggleIntegrationType = (type) => {
    setIntegrationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setIntegrationTypes([]);
    setSelectedTags([]);
    setFilterDropdownOpen(false);
  };

  const resetAll = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setIntegrationTypes([]);
    setSelectedTags([]);
    setFilterDropdownOpen(false);
  };

  const isFiltered =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    integrationTypes.length > 0 ||
    selectedTags.length > 0;

  const chipItems = useMemo(() => {
    const selected = selectedTags.map((tag) => ({ tag, active: true }));
    const unselected = allTags
      .filter((tag) => !selectedTags.includes(tag))
      .map((tag) => ({ tag, active: false }));
    return [...selected, ...unselected];
  }, [selectedTags, allTags]);


  useLayoutEffect(() => {
    const row = chipsRowRef.current;
    const ruler = chipsRulerRef.current;
    if (!row || !ruler) return;
    if (chipItems.length === 0) {
      setVisibleChipCount(0);
      return;
    }
    const GAP = 8;
    const RESERVED_MORE = 96;
    const summaryEl = row.querySelector('.catalog-result-summary');
    const rowWidth = row.getBoundingClientRect().width;
    const summaryWidth = summaryEl ? summaryEl.getBoundingClientRect().width + 12 : 0;
    const available = rowWidth - summaryWidth - RESERVED_MORE;

    const children = ruler.children;
    let total = 0;
    let count = 0;
    for (let i = 0; i < children.length; i++) {
      const w = children[i].getBoundingClientRect().width + (i > 0 ? GAP : 0);
      if (total + w > available) break;
      total += w;
      count++;
    }
    setVisibleChipCount(count === 0 ? 1 : count);
  }, [chipItems.length, chipItems, chipsResizeKey]);

  useEffect(() => {
    const row = chipsRowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => setChipsResizeKey((k) => k + 1));
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const onScroll = () => setTitleCollapsed(el.scrollTop > 0);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // #region agent log
  useEffect(() => {
    const stickyEl = stickyHeaderRef.current;
    const catalogPage = catalogPageRef.current;
    if (!stickyEl || !catalogPage) return;
    const log = (message, data, hypothesisId) => {
      fetch('http://127.0.0.1:7726/ingest/65006c24-f02f-4487-bd49-869cea716f61', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'cb3dd5' }, body: JSON.stringify({ sessionId: 'cb3dd5', location: 'Catalog.jsx:sticky-debug', message, data: data || {}, hypothesisId: hypothesisId || null, timestamp: Date.now() }) }).catch(() => {});
    };
    const stickyStyle = getComputedStyle(stickyEl);
    const ancestors = [];
    let node = stickyEl.parentElement;
    while (node && node !== document.body) {
      const s = getComputedStyle(node);
      ancestors.push({ tag: node.tagName, class: node.className?.slice(0, 80), overflow: s.overflow, overflowY: s.overflowY, transform: s.transform, filter: s.filter });
      node = node.parentElement;
    }
    log('mount: scroll container and sticky', {
      catalogPageScrollHeight: catalogPage.scrollHeight,
      catalogPageClientHeight: catalogPage.clientHeight,
      catalogPageScrollTop: catalogPage.scrollTop,
      stickyPosition: stickyStyle.position,
      stickyTop: stickyStyle.top,
      ancestors,
    }, 'H1');
    const onScroll = () => {
      const rect = stickyEl.getBoundingClientRect();
      log('scroll', { catalogPageScrollTop: catalogPage.scrollTop, stickyRectTop: rect.top, stickyRectBottom: rect.bottom }, 'H5');
    };
    catalogPage.addEventListener('scroll', onScroll, { passive: true });
    return () => catalogPage.removeEventListener('scroll', onScroll);
  }, []);
  // #endregion

  return (
    <main className="catalog-page" ref={catalogPageRef}>
      <h1 className={`catalog-title${titleCollapsed ? ' catalog-title-collapsed' : ''}`}>Catalog</h1>

      <div className="catalog-sticky-header" ref={stickyHeaderRef}>
      {/* Toolbar: single horizontal row on desktop (Search | Filters | Sort by | View toggle) */}
      <div className="catalog-toolbar">
        <div className="catalog-search-wrap">
          <SearchIconSvg className="catalog-search-icon" />
          <input
            type="search"
            className="catalog-search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
        </div>
        <div className="catalog-filter-btn-wrap" ref={filterDropdownRef}>
          <button
            ref={filterButtonRef}
            type="button"
            className="catalog-filter-btn"
            onClick={() => setFilterDropdownOpen((o) => !o)}
            aria-expanded={filterDropdownOpen}
            aria-haspopup="true"
            aria-label="Open filters"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="catalog-filter-badge" aria-label={`${activeFilterCount} filters active`}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon className="catalog-chevron" />
          </button>
          <Menu
            anchorEl={filterButtonRef.current}
            open={filterDropdownOpen}
            onClose={(_, reason) => {
              if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                setFilterDropdownOpen(false);
              }
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                onClick: (e) => e.stopPropagation(),
                sx: {
                  mt: 1.5,
                  minWidth: 280,
                  borderRadius: 2,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                },
              },
            }}
            MenuListProps={{ sx: { py: 0 } }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" fontWeight={600}>Filter by</Typography>
              <Button size="small" color="primary" onClick={clearFilters} sx={{ textTransform: 'none', minWidth: 0 }}>
                Clear filters
              </Button>
            </Box>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>Status</Typography>
              {['all', 'Available', 'Coming soon'].map((value) => {
                const filterValue = value === 'all' ? 'all' : value;
                const label = value === 'all' ? 'All statuses' : value;
                const count = statusCounts[value === 'all' ? 'all' : value];
                return (
                  <MenuItem
                    key={value}
                    onClick={() => setStatusFilter(filterValue)}
                    sx={{ py: 0.25, px: 1, borderRadius: 1 }}
                    disableRipple={false}
                  >
                    <Radio
                      checked={statusFilter === filterValue}
                      size="small"
                      disableRipple
                      sx={{ p: 0.5, mr: 1 }}
                      tabIndex={-1}
                    />
                    <ListItemText primary={<>{label} <span className="catalog-filter-count">({count})</span></>} />
                  </MenuItem>
                );
              })}
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>Integration type</Typography>
              {allIntegrationTypes.map((type) => {
                const count = integrationTypes.includes(type)
                  ? (integrationTypeContributionCounts[type] ?? 0)
                  : (integrationTypeCounts[type] ?? 0);
                return (
                  <MenuItem
                    key={type}
                    onClick={() => toggleIntegrationType(type)}
                    sx={{ py: 0.25, px: 1, borderRadius: 1 }}
                    disableRipple={false}
                  >
                    <Checkbox
                      checked={integrationTypes.includes(type)}
                      size="small"
                      disableRipple
                      sx={{ p: 0.5, mr: 1 }}
                      tabIndex={-1}
                    />
                    <ListItemText primary={<>{type} <span className="catalog-filter-count">({count})</span></>} />
                  </MenuItem>
                );
              })}
            </Box>
          </Menu>
        </div>
        <div className="catalog-sort-wrap">
          <span className="catalog-sort-label-text" id="catalog-sort-label">Sort by</span>
          <span className="catalog-sort-value-text" aria-hidden="true">
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Name A–Z'}
          </span>
          <ChevronDownIcon className="catalog-sort-chevron" aria-hidden="true" />
          <select
            id="catalog-sort"
            className="catalog-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-labelledby="catalog-sort-label"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="catalog-view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Narrow card view"
          >
            <GridViewIconSvg />
          </button>
          <button
            type="button"
            className={`catalog-view-btn ${viewMode === 'grid-dense' ? 'active' : ''}`}
            onClick={() => setViewMode('grid-dense')}
            aria-pressed={viewMode === 'grid-dense'}
            aria-label="Wide card view"
          >
            <WideViewIconSvg />
          </button>
        </div>
      </div>

      {/* Chips row: active = blue + white X in circle, inactive = gray, More (n) with caret — 1:1 spec */}
      <div className="catalog-chips-row" ref={chipsRowRef}>
        <div className="catalog-chips">
          {chipItems.slice(0, chipItems.length > visibleChipCount ? visibleChipCount + 1 : visibleChipCount).map(({ tag, active }) => {
            const count = active ? (tagContributionCounts[tag] ?? 0) : (tagCounts[tag] ?? 0);
            return (
            <button
              key={tag}
              type="button"
              className={`catalog-chip ${active ? 'catalog-chip-active' : 'catalog-chip-inactive'}`}
              onClick={() => toggleTag(tag)}
              aria-label={active ? `Remove filter ${tag}` : `Filter by ${tag}`}
            >
              {tag} <span className="catalog-filter-count">({count})</span>
              {active && (
                <span
                  className="catalog-chip-remove"
                  onClick={(e) => { e.stopPropagation(); toggleTag(tag); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </span>
              )}
            </button>
            );
          })}
          {chipItems.length > visibleChipCount && (
            <div className="catalog-chips-fade" aria-hidden="true" />
          )}
        </div>
        {chipItems.length > visibleChipCount && (
          <div className="catalog-chips-more" ref={chipsMoreRef}>
            <button
              ref={chipsMoreButtonRef}
              type="button"
              className={`catalog-chips-more-btn${chipsMoreOpen ? ' catalog-chips-more-btn--open' : ''}`}
              onClick={() => setChipsMoreOpen((o) => !o)}
              aria-expanded={chipsMoreOpen}
              aria-haspopup="true"
              aria-label="More filters"
            >
              More ({chipItems.length - visibleChipCount})
              <ChevronDownIcon className="catalog-chevron" />
            </button>
            <Menu
              anchorEl={chipsMoreButtonRef.current}
              open={chipsMoreOpen}
              onClose={(_, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                  setChipsMoreOpen(false);
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  onClick: (e) => e.stopPropagation(),
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    maxWidth: 320,
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    borderRadius: 2,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  },
                },
              }}
              MenuListProps={{
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  p: 1.5,
                },
              }}
            >
              {chipItems.slice(visibleChipCount).map(({ tag, active }) => {
                const count = active ? (tagContributionCounts[tag] ?? 0) : (tagCounts[tag] ?? 0);
                return (
                <button
                  key={tag}
                  type="button"
                  className={`catalog-chip ${active ? 'catalog-chip-active' : 'catalog-chip-inactive'}`}
                  onClick={() => toggleTag(tag)}
                  style={{ margin: 0 }}
                >
                  {tag} <span className="catalog-filter-count">({count})</span>
                  {active && (
                    <span className="catalog-chip-remove" aria-hidden>×</span>
                  )}
                </button>
                );
              })}
            </Menu>
          </div>
        )}
      </div>
      <div className="catalog-result-row">
        <span className="catalog-result-summary">
          Showing {totalFiltered} of {productsWithStatus.length} products
        </span>
        {isFiltered && (
          <button type="button" className="catalog-reset-btn" onClick={resetAll}>
            Clear filters
          </button>
        )}
      </div>
      </div>{/* end catalog-sticky-header */}
      <div className="catalog-chips-ruler" ref={chipsRulerRef} aria-hidden="true">
        {chipItems.map(({ tag, active }) => {
          const count = active ? (tagContributionCounts[tag] ?? 0) : (tagCounts[tag] ?? 0);
          return (
          <span key={tag} className={`catalog-chip ${active ? 'catalog-chip-active' : 'catalog-chip-inactive'}`}>
            {tag} <span className="catalog-filter-count">({count})</span>
            {active && <span className="catalog-chip-remove">×</span>}
          </span>
          );
        })}
      </div>

      <div className="catalog-scroll-area" ref={scrollAreaRef}>
      {totalFiltered === 0 && (
        <div className="catalog-empty" role="status">
          <NothingFoundSvg className="catalog-empty-graphic" />
          <p>No products found with your search and filters.</p>
          <button type="button" className="catalog-empty-clear" onClick={clearFilters}>
            Clear search and filters
          </button>
        </div>
      )}

      {viewMode === 'grid' && totalFiltered > 0 && (
        <div className="catalog-grid">
          {displayProducts.map((product) => (
            <article key={product.id} className="catalog-card">
              {product.status === 'Coming soon' && (
                <div className="catalog-card-coming-soon-banner" aria-label="Coming soon">
                  <span>Coming Soon</span>
                </div>
              )}
              <div className="catalog-card-header">
                <div
                  className="catalog-card-logo-area"
                  style={logoColors[product.id] ? {
                    background: buildGradientBackground(
                      logoColors[product.id].r,
                      logoColors[product.id].g,
                      logoColors[product.id].b,
                      getCardVariant(product.id)
                    ),
                  } : undefined}
                >
                  <ProductLogo
                    name={product.name}
                    logoPath={product.logoPath}
                    onColorExtracted={(color) => handleColorExtracted(product.id, color)}
                    id={product.id === 'digital-customer-service-85kedd' ? 'linklive-full-logo' : undefined}
                  />
                </div>
              </div>
              <div className="catalog-card-body">
                <div className="catalog-card-title-wrap">
                  <h3 className="catalog-card-title">
                    {product.tagLine || product.name}
                  </h3>
                </div>
                <p className="catalog-card-description">
                  {product.description?.replace(/\n/g, ' ').slice(0, 120)}
                  {(product.description?.length || 0) > 120 ? '…' : ''}
                </p>
                <div className="product-tags">
                  {(product.tags || []).map((tag) => (
                    <span key={tag} className="product-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {viewMode === 'grid-dense' && totalFiltered > 0 && (
        <div className="catalog-grid-dense">
          {displayProducts.map((product) => (
            <article key={product.id} className="catalog-card-wide">
              <div
                className="catalog-card-wide-hero"
                style={(() => {
                  const color = (product.heroPath && heroColors[product.id])
                    ? heroColors[product.id]
                    : logoColors[product.id];
                  return color ? {
                    background: buildGradientBackground(color.r, color.g, color.b, getCardVariant(product.id)),
                  } : undefined;
                })()}
              >
                {product.status === 'Coming soon' && (
                  <div className="catalog-card-coming-soon-banner" aria-label="Coming soon">
                    <span>Coming Soon</span>
                  </div>
                )}
                {product.heroPath ? (
                  <img
                    className="catalog-card-wide-hero-img"
                    src={assetUrl(product.heroPath)}
                    alt=""
                    loading="lazy"
                    onLoad={(e) => {
                      const color = extractDominantColor(e.currentTarget);
                      handleHeroColorExtracted(product.id, color);
                    }}
                  />
                ) : (
                  <div className="catalog-card-wide-hero-logo-wrap">
                    <ProductLogo
                      name={product.name}
                      logoPath={product.logoPath}
                      onColorExtracted={(color) => handleColorExtracted(product.id, color)}
                      id={product.id === 'digital-customer-service-85kedd' ? 'linklive-full-logo' : undefined}
                    />
                  </div>
                )}
              </div>
              <div className="catalog-card-wide-body">
                <div className="catalog-card-wide-top-row">
                  <div className="catalog-card-wide-header">
                    <ProductLogo
                      name={product.name}
                      logoPath={product.logoPath}
                      onColorExtracted={(color) => handleColorExtracted(product.id, color)}
                      id={product.id === 'digital-customer-service-85kedd' ? 'linklive-full-logo-wide' : undefined}
                    />
                    <span className="catalog-card-wide-name">{product.name}</span>
                  </div>
                  <div className="product-tags">
                    {(product.tags || []).map((tag) => (
                      <span key={tag} className="product-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className="catalog-card-wide-provider">
                  From {product.provider}
                </span>
                <h3 className="catalog-card-wide-tagline">
                  {product.tagLine || product.name}
                </h3>
                <p className="catalog-card-wide-description">
                  {product.description?.replace(/\n/g, ' ')}
                </p>
                <div className="catalog-card-wide-meta">
                  <span className="integration">{product.integrationType}</span>
                  {' · '}
                  {product.timeline}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>

    </main>
  );
}
