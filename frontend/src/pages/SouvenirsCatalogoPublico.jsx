import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Badge,
  Input,
  Tooltip
} from '@fluentui/react-components';
import {
  Search24Regular,
  Box24Regular,
  Link24Regular,
  Share24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Gift24Regular,
  ShoppingBag24Regular,
  ArrowRight24Regular
} from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from '../components/ui';
import { useAuth, useNotify, useTheme } from '../App';
import adminService from '../services/adminService';
import { resolveApiFileUrl } from '../services/api';
import { designTokens } from '../theme/theme';

const DEFAULT_SOUVENIR_IMG = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop";

const useStyles = makeStyles({
  container: {
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '700px',
    height: '700px',
    background: tokens.colorBrandBackground2,
    filter: 'blur(160px)',
    ...shorthands.borderRadius('50%'),
    opacity: 0.16,
    zIndex: 0,
    top: '-150px',
    right: '-150px',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '16px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 90%, transparent)`,
    backdropFilter: 'blur(20px)',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    '@media (max-width: 600px)': {
      padding: '12px 16px',
    }
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  logo: {
    width: '36px',
    height: '36px',
    filter: 'drop-shadow(0 0 10px rgba(127, 19, 236, 0.5))',
  },
  mainWrapper: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 24px 64px 24px',
    zIndex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    '@media (max-width: 600px)': {
      padding: '24px 14px 48px 14px',
    }
  },
  heroBanner: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 0',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '16px 20px',
    ...shorthands.borderRadius('16px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    boxShadow: tokens.shadow4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('20px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    overflow: 'hidden',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.25s ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16,
      ...shorthands.borderColor(tokens.colorBrandStroke1)
    }
  },
  imageWrapper: {
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.35s ease',
    ':hover': {
      transform: 'scale(1.05)'
    }
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flexGrow: 1,
    justifyContent: 'space-between'
  }
});

const SouvenirsCatalogoPublico = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { currentTheme, theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { notify } = useNotify();

  const [loading, setLoading] = useState(true);
  const [souvenirs, setSouvenirs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const data = await adminService.getSouvenirs();
        // Filtrar productos eliminados (id_estado = 0) o inactivos (id_estado = 1) si se desea
        const activeOnly = (Array.isArray(data) ? data : []).filter(p => p.id_estado !== 0 && p.id_estado !== 1);
        setSouvenirs(activeOnly);
      } catch (err) {
        console.error("Error al cargar catálogo:", err);
        setSouvenirs([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchCatalog();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return souvenirs;
    const term = search.toLowerCase();
    return souvenirs.filter(s =>
      (s.nombre && s.nombre.toLowerCase().includes(term)) ||
      (s.descripcion && s.descripcion.toLowerCase().includes(term))
    );
  }, [souvenirs, search]);

  const handleCopyProductLink = (id_producto, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/souvenir/${id_producto}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        notify("Enlace Copiado", "Enlace al souvenir copiado al portapapeles", "success");
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glow} />

      {/* Header Luma-Style */}
      <header className={styles.header}>
        <Link to="/" className={styles.logoContainer}>
          <img src={designTokens.logo} alt="MEH Logo" className={styles.logo} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', lineHeight: '1.2' }}>Microsoft Education Hub</span>
            <span style={{ fontSize: '11px', opacity: 0.7 }}>Tienda Oficial & Merch</span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Tooltip content="Cambiar tema" relationship="label">
            <MEHButton appearance="subtle" size="small" onClick={toggleTheme}>
              {(currentTheme === 'light' ? <WeatherMoon24Regular /> : <WeatherSunny24Regular />)}
            </MEHButton>
          </Tooltip>

          {user ? (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <MEHButton appearance="outline" size="small">Mi Dashboard</MEHButton>
            </Link>
          ) : (
            <Link to="/login?returnTo=/souvenirs" style={{ textDecoration: 'none' }}>
              <MEHButton appearance="primary" size="small">Iniciar Sesión</MEHButton>
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.mainWrapper}>
        <div className={styles.heroBanner}>
          <Badge appearance="filled" color="brand" size="large">
            🛍️ Tienda Oficial de la Comunidad
          </Badge>
          <MEHTypography variant="h1" style={{ margin: '4px 0', fontSize: '36px', fontWeight: '800' }}>
            Souvenirs & Merch Oficial MEH
          </MEHTypography>
          <MEHTypography variant="body" style={{ maxWidth: '640px', opacity: '0.8', fontSize: '15px', lineHeight: 1.5 }}>
            Consigue las poleras, kits exclusivos y artículos conmemorativos de Microsoft Education Hub. Adquiérelos por transferencia bancaria y retíralos con tu entrada QR en eventos oficiales.
          </MEHTypography>
        </div>

        {/* Barra de Filtro y Búsqueda */}
        <div className={styles.filterBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag24Regular fontSize={20} style={{ color: tokens.colorBrandForeground1 }} />
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {filtered.length} {filtered.length === 1 ? 'Producto disponible' : 'Productos disponibles'}
            </span>
          </div>

          <div style={{ maxWidth: '320px', width: '100%' }}>
            <Input
              contentBefore={<Search24Regular />}
              placeholder="Buscar por nombre o descripción..."
              value={search}
              onChange={(e, d) => setSearch(d.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Grid de Productos */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <Spinner size="large" label="Cargando catálogo de souvenirs..." />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: '20px', border: `1px solid ${tokens.colorNeutralBackground3}` }}>
            <Box24Regular fontSize={48} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <MEHTypography variant="h3">No se encontraron productos</MEHTypography>
            <MEHTypography variant="body" style={{ opacity: 0.7, marginTop: '4px' }}>
              {search ? 'Intenta con otro término de búsqueda.' : 'Pronto publicaremos nuevos souvenirs oficiales para ti.'}
            </MEHTypography>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((item) => {
              const img = item.imagen_url ? resolveApiFileUrl(item.imagen_url) : DEFAULT_SOUVENIR_IMG;
              const isAgotado = (item.stock || 0) <= 0;
              return (
                <div key={item.id_producto} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img src={img} alt={item.nombre} className={styles.cardImage} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      {isAgotado ? (
                        <Badge appearance="filled" color="danger">Agotado</Badge>
                      ) : (
                        <Badge appearance="filled" color="success">Stock: {item.stock}</Badge>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                        {item.categoria || 'SOUVENIR'}
                      </span>
                      <MEHTypography variant="bold" style={{ fontSize: '18px', display: 'block', marginTop: '2px', lineHeight: 1.3 }}>
                        {item.nombre}
                      </MEHTypography>
                      <MEHTypography variant="caption" style={{ opacity: 0.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '6px', lineHeight: 1.4 }}>
                        {item.descripcion || 'Edición oficial MEH.'}
                      </MEHTypography>
                    </div>

                    <div style={{ borderTop: `1px solid ${tokens.colorNeutralBackground3}`, paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>Precio:</span>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: tokens.colorBrandForeground1 }}>
                          Bs. {item.precio}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <MEHButton
                          size="small"
                          appearance="outline"
                          icon={<Link24Regular />}
                          onClick={(e) => handleCopyProductLink(item.id_producto, e)}
                          title="Copiar link directo"
                        />
                        <Link to={`/souvenir/${item.id_producto}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
                          <MEHButton
                            size="small"
                            appearance="primary"
                            icon={<ArrowRight24Regular />}
                            iconPosition="after"
                            style={{ width: '100%' }}
                          >
                            Ver y Adquirir
                          </MEHButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SouvenirsCatalogoPublico;
