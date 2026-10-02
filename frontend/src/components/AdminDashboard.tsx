import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Painting, Category, Inquiry, AdminStats, User, Banner, ShowcaseItem, ProductSection, Testimonial, FooterConfig, FeatureBadge, CustomFooterLink, ArtworkTabsConfig } from '../types';
import { api, BACKEND_URL, getImageUrl } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  CreditCard,
  Activity,
  ArrowUpRight,
  Search,
  RefreshCw,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sun,
  X,
  Upload,
  ShoppingBag,
  Store,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  MapPin,
  Mail,
  Image as ImageIcon,
  Eye,
  ArrowLeft,
  ArrowRight,
  Layers,
  FolderTree,
  Quote,
  PanelBottom,
  Award,
  Sparkles,
  CheckCircle2,
  Truck,
  Lock,
  KeyRound,
  EyeOff,
  Menu,
  RotateCcw,
  SlidersHorizontal,
  Filter,
  LogOut,
  Heart,
  Star,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize active section with URL path
  const getSectionFromPath = (): 'overview' | 'products' | 'inquiries' | 'users' | 'banners' | 'showcase' | 'sections' | 'categories' | 'testimonials' | 'footer' | 'settings' => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/inquiries')) return 'inquiries';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/banners')) return 'banners';
    if (path.includes('/admin/showcase')) return 'showcase';
    if (path.includes('/admin/sections')) return 'sections';
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/testimonials')) return 'testimonials';
    if (path.includes('/admin/footer')) return 'footer';
    if (path.includes('/admin/settings')) return 'settings';
    return 'overview';
  };

  const navSection = getSectionFromPath();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'analytics' | 'reports' | 'notifications'>('overview');

  // Data states
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [showProductFilter, setShowProductFilter] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');

  // Dashboard Date & Time Filter States
  const [dashboardDateRange, setDashboardDateRange] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'custom'>('all');
  const [dashboardStartDate, setDashboardStartDate] = useState<string>(() => {
    const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [dashboardStartTime, setDashboardStartTime] = useState<string>('00:00');
  const [dashboardEndDate, setDashboardEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [dashboardEndTime, setDashboardEndTime] = useState<string>('23:59');

  // Sections state
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ProductSection | null>(null);
  const [uploadingSectionImage, setUploadingSectionImage] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  // Categories state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  });

  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialFormData, setTestimonialFormData] = useState({
    name: '',
    location: '',
    quote: '',
    rating: 5,
    avatar_url: '',
    display_order: 1,
    is_active: true,
  });

  // Footer configuration state
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    brand_name: '',
    brand_subtitle: '',
    brand_logo_url: '',
    brand_description: 'Original Fine Art, Curated Paintings & Bespoke Framing.',
    studio_location: 'Studio: Mumbai & Chennai, India',
    payment_image_url: 'https://preview.colorlib.com/theme/malefashion/img/payment.png',
    show_payment_methods: false,
    feature_badges: [
      {
        icon: 'truck',
        title: 'FREE GLOBAL INSURED DELIVERY',
        subtitle: 'Climate-controlled custom art crates',
      },
      {
        icon: 'shield',
        title: '100% AUTHENTICITY GUARANTEE',
        subtitle: 'Signed certificate with forensic provenance',
      },
      {
        icon: 'refresh',
        title: '30-DAY CURATED RETURN WINDOW',
        subtitle: 'Risk-free visual trial in your residence',
      },
    ],
    categories_title: 'CURATED CATEGORIES',
    max_categories_to_show: 7,
    custom_column_title: 'CURATION DESK',
    custom_links: [
      { title: 'Direct WhatsApp Advisory', url: '#' },
      { title: 'Custom Bespoke Framing', url: '#' },
      { title: 'Art Authentication Registry', url: '#' },
      { title: 'White-Glove Courier Setup', url: '#' },
    ],
    newsletter_title: 'NEWSLETTER',
    newsletter_description: 'Be the first to know about new arrivals, private salon exhibitions & exclusive sales!',
    newsletter_placeholder: 'Your email',
    copyright_text: 'Copyright © 2026 All rights reserved | Art Gallery Curations & Studio',
    contact_phone: '+91 98765 43210',
    contact_email: 'hello@gmail.com',
    social_links: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      whatsapp: '+91 98765 43210',
    },
  });
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [footerSaveSuccess, setFooterSaveSuccess] = useState(false);

  // Store Logo & Branding in Settings state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [storeBrandingSuccessMsg, setStoreBrandingSuccessMsg] = useState('');
  const [storeBrandingErrorMsg, setStoreBrandingErrorMsg] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedPreviewBannerId, setSelectedPreviewBannerId] = useState<number | null>(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    tag: 'ABSTRACT & MODERN CURATION',
    title: '',
    description: '',
    button_text: 'SHOP NOW',
    image_url: '',
    artist_name: '',
    price: '',
    circle_color: '#eedcd5',
    bg_color: '#f3f2ee',
    text_color: '#ffffff',
    is_active: true,
    display_order: 1,
  });

  // Showcase Marquee state
  const [showcases, setShowcases] = useState<ShowcaseItem[]>([]);
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<ShowcaseItem | null>(null);
  const [uploadingShowcaseImage, setUploadingShowcaseImage] = useState(false);
  const [showcaseFormData, setShowcaseFormData] = useState({
    image_url: '',
    title: '',
    tag: 'FEATURED',
    description: '',
    display_order: 1,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for creating/editing painting
  const [showPaintingModal, setShowPaintingModal] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    description: '',
    category_id: '',
    section_id: '',
    medium: 'Oil on Canvas',
    dimensions: '',
    price: '',
    mrp: '',
    image_url: '',
    image_url_2: '',
    image_url_3: '',
    is_framed: true,
    status: 'available' as 'available' | 'reserved' | 'sold' | 'inactive',
    featured: false,
  });

  // Inquiry filter
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('');
  const [inquiryNotes, setInquiryNotes] = useState<{ [key: number]: string }>({});

  // WhatsApp Order & Inquiry Number Modal state
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [tempWhatsappNumber, setTempWhatsappNumber] = useState('');
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [whatsappSaveSuccess, setWhatsappSaveSuccess] = useState(false);

  // Artwork Page Information Tabs & Trust Badges Modal state
  const [showArtworkTabsModal, setShowArtworkTabsModal] = useState(false);

  // Current Logged-in Admin Profile & Password Reset state
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminProfileForm, setAdminProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paintingsData, categoriesData, inquiriesData, statsData, usersData, bannersData, showcasesData, sectionsData, testimonialsData, footerData] = await Promise.all([
        api.getPaintings(),
        api.getCategories(),
        api.getAllInquiries(),
        api.getAdminStats(),
        api.getAllUsers(),
        api.getAllBannersAdmin(),
        api.getAllShowcaseItemsAdmin(),
        api.getAllSectionsAdmin(),
        api.getAllTestimonialsAdmin(),
        api.getFooterConfigAdmin(),
      ]);
      setPaintings(paintingsData);
      setCategories(categoriesData);
      setInquiries(inquiriesData);
      setStats(statsData);
      setUsers(usersData);
      setBanners(bannersData);
      setShowcases(showcasesData);
      setSections(sectionsData);
      setTestimonials(testimonialsData);
      if (footerData) {
        setFooterConfig(footerData);
      }

      // Fetch or resolve current admin details
      try {
        const me = await api.getMe();
        setAdminUser(me);
        setAdminProfileForm({
          full_name: me.full_name || '',
          email: me.email || '',
          phone: me.phone || '',
          address: me.address || '',
          city: me.city || '',
        });
      } catch {
        const foundAdmin = usersData.find((u) => u.role === 'admin');
        if (foundAdmin) {
          setAdminUser(foundAdmin);
          setAdminProfileForm({
            full_name: foundAdmin.full_name || '',
            email: foundAdmin.email || '',
            phone: foundAdmin.phone || '',
            address: foundAdmin.address || '',
            city: foundAdmin.city || '',
          });
        }
      }

      const notesMap: { [key: number]: string } = {};
      inquiriesData.forEach((inq) => {
        notesMap[inq.id] = inq.admin_notes || '';
      });
      setInquiryNotes(notesMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin portal data');
    } finally {
      setLoading(false);
    }
  };

  const openAddPaintingModal = () => {
    setEditingPainting(null);
    setFormData({
      title: '',
      artist_name: 'Master Artist',
      description: '',
      category_id: categories[0]?.id?.toString() || '',
      section_id: '',
      medium: 'Oil on Canvas',
      dimensions: '36 x 48 inches (91 x 122 cm)',
      price: '',
      mrp: '',
      image_url: '',
      image_url_2: '',
      image_url_3: '',
      is_framed: true,
      status: 'available',
      featured: false,
    });
    setShowPaintingModal(true);
  };

  const openEditPaintingModal = (painting: Painting) => {
    setEditingPainting(painting);
    setFormData({
      title: painting.title,
      artist_name: painting.artist_name,
      description: painting.description,
      category_id: painting.category_id?.toString() || '',
      section_id: painting.section_id?.toString() || '',
      medium: painting.medium,
      dimensions: painting.dimensions,
      price: painting.price.toString(),
      mrp: painting.mrp != null ? painting.mrp.toString() : '',
      image_url: painting.image_url,
      image_url_2: painting.image_url_2 || '',
      image_url_3: painting.image_url_3 || '',
      is_framed: painting.is_framed,
      status: painting.status,
      featured: painting.featured,
    });
    setShowPaintingModal(true);
  };

  // Section Management Handlers
  const openAddSectionModal = () => {
    setEditingSection(null);
    setSectionFormData({
      name: '',
      description: '',
      image_url: '',
      display_order: sections.length + 1,
      is_active: true,
    });
    setShowSectionModal(true);
  };

  const openEditSectionModal = (sec: ProductSection) => {
    setEditingSection(sec);
    setSectionFormData({
      name: sec.name,
      description: sec.description || '',
      image_url: sec.image_url || '',
      display_order: sec.display_order,
      is_active: sec.is_active,
    });
    setShowSectionModal(true);
  };

  const handleSectionImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSectionImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setSectionFormData((prev) => ({ ...prev, image_url: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload section image');
    } finally {
      setUploadingSectionImage(false);
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionFormData.name.trim()) {
      alert('Please enter a section name.');
      return;
    }

    try {
      if (editingSection) {
        await api.updateSection(editingSection.id, {
          name: sectionFormData.name.trim(),
          description: sectionFormData.description.trim() || undefined,
          image_url: sectionFormData.image_url.trim() || undefined,
          display_order: Number(sectionFormData.display_order) || 1,
          is_active: sectionFormData.is_active,
        });
      } else {
        await api.createSection({
          name: sectionFormData.name.trim(),
          description: sectionFormData.description.trim() || undefined,
          image_url: sectionFormData.image_url.trim() || undefined,
          display_order: Number(sectionFormData.display_order) || 1,
          is_active: sectionFormData.is_active,
        });
      }
      setShowSectionModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save product section');
    }
  };

  const handleDeleteSection = async (secId: number) => {
    const sec = sections.find((s) => s.id === secId);
    if (!window.confirm(`Are you sure you want to delete the section "${sec?.name || ''}"? Artworks assigned to this section will remain in your store under the general catalog.`)) {
      return;
    }
    try {
      await api.deleteSection(secId);
      setSections((prev) => prev.filter((s) => s.id !== secId));
      if (formData.section_id === secId.toString()) {
        setFormData((prev) => ({ ...prev, section_id: '' }));
      }
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete section');
    }
  };

  // Category Management Handlers
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
    });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug || '',
      description: cat.description || '',
      image_url: cat.image_url || '',
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      alert('Please enter a category name.');
      return;
    }

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: categoryFormData.name.trim(),
          slug: categoryFormData.slug.trim() || undefined,
          description: categoryFormData.description.trim() || undefined,
          image_url: categoryFormData.image_url.trim() || undefined,
        });
      } else {
        await api.createCategory({
          name: categoryFormData.name.trim(),
          slug: categoryFormData.slug.trim() || undefined,
          description: categoryFormData.description.trim() || undefined,
          image_url: categoryFormData.image_url.trim() || undefined,
        });
      }
      setShowCategoryModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!window.confirm(`Are you sure you want to delete collection "${cat?.name || ''}"? Artworks assigned to this collection will remain in your store under unassigned collection.`)) {
      return;
    }
    try {
      await api.deleteCategory(catId);
      const remaining = categories.filter((c) => c.id !== catId);
      setCategories(remaining);
      if (formData.category_id === catId.toString()) {
        setFormData((prev) => ({ ...prev, category_id: remaining[0]?.id?.toString() || '' }));
      }
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleCategoryImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategoryImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setCategoryFormData((prev) => ({ ...prev, image_url: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload category image');
    } finally {
      setUploadingCategoryImage(false);
    }
  };

  const handleAddCategoryPrompt = () => {
    openAddCategoryModal();
  };

  const handleDeleteCategoryPrompt = (catId: number) => {
    handleDeleteCategory(catId);
  };

  // Testimonial Management Handlers
  const openAddTestimonialModal = () => {
    setEditingTestimonial(null);
    setTestimonialFormData({
      name: '',
      location: '',
      quote: '',
      rating: 5,
      avatar_url: '',
      display_order: testimonials.length + 1,
      is_active: true,
    });
    setShowTestimonialModal(true);
  };

  const openEditTestimonialModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setTestimonialFormData({
      name: t.name,
      location: t.location || '',
      quote: t.quote,
      rating: t.rating || 5,
      avatar_url: t.avatar_url || '',
      display_order: t.display_order,
      is_active: t.is_active,
    });
    setShowTestimonialModal(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialFormData.name.trim() || !testimonialFormData.quote.trim()) {
      alert('Please fill out Patron Name and Testimonial Quote.');
      return;
    }

    try {
      if (editingTestimonial) {
        await api.updateTestimonial(editingTestimonial.id, {
          name: testimonialFormData.name.trim(),
          location: testimonialFormData.location.trim() || undefined,
          quote: testimonialFormData.quote.trim(),
          rating: Number(testimonialFormData.rating) || 5,
          avatar_url: testimonialFormData.avatar_url.trim() || undefined,
          display_order: Number(testimonialFormData.display_order) || 1,
          is_active: testimonialFormData.is_active,
        });
      } else {
        await api.createTestimonial({
          name: testimonialFormData.name.trim(),
          location: testimonialFormData.location.trim() || undefined,
          quote: testimonialFormData.quote.trim(),
          rating: Number(testimonialFormData.rating) || 5,
          avatar_url: testimonialFormData.avatar_url.trim() || undefined,
          display_order: Number(testimonialFormData.display_order) || 1,
          is_active: testimonialFormData.is_active,
        });
      }
      setShowTestimonialModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save testimonial');
    }
  };

  const handleToggleTestimonialActive = async (id: number) => {
    try {
      await api.toggleTestimonialActive(id);
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle testimonial status');
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patron testimonial?')) {
      return;
    }
    try {
      await api.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete testimonial');
    }
  };

  // Footer Management Handlers
  const handleSaveFooterConfig = async () => {
    setIsSavingFooter(true);
    setFooterSaveSuccess(false);
    try {
      const updated = await api.updateFooterConfig(footerConfig);
      setFooterConfig(updated);
      try {
        localStorage.setItem('artweb_footer_config', JSON.stringify(updated));
        window.dispatchEvent(new Event('artweb_footer_config_updated'));
      } catch (e) {}
      setFooterSaveSuccess(true);
      setTimeout(() => setFooterSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save footer settings');
    } finally {
      setIsSavingFooter(false);
    }
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setStoreBrandingErrorMsg('');
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setFooterConfig((prev) => ({ ...prev, brand_logo_url: fullUrl }));
      setStoreBrandingSuccessMsg('Logo uploaded! Click "Save Store Branding & Logo" below to apply changes.');
    } catch (err: any) {
      setStoreBrandingErrorMsg(err.message || 'Failed to upload logo image');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFooterConfig((prev) => ({ ...prev, brand_logo_url: '' }));
    setStoreBrandingSuccessMsg('Logo removed. Click "Save Store Branding & Logo" below to apply changes.');
  };

  const handleSaveStoreBranding = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingBranding(true);
    setStoreBrandingSuccessMsg('');
    setStoreBrandingErrorMsg('');

    try {
      const updated = await api.updateFooterConfig(footerConfig);
      setFooterConfig(updated);
      try {
        localStorage.setItem('artweb_footer_config', JSON.stringify(updated));
        window.dispatchEvent(new Event('artweb_footer_config_updated'));
      } catch (e) {}
      setStoreBrandingSuccessMsg('Store logo and brand identity saved successfully!');
      setTimeout(() => setStoreBrandingSuccessMsg(''), 4000);
    } catch (err: any) {
      setStoreBrandingErrorMsg(err.message || 'Failed to save store branding');
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleUpdateBadge = (index: number, field: keyof FeatureBadge, value: string) => {
    const updatedBadges = [...(footerConfig.feature_badges || [])];
    if (!updatedBadges[index]) {
      updatedBadges[index] = { icon: 'truck', title: '', subtitle: '' };
    }
    updatedBadges[index] = { ...updatedBadges[index], [field]: value };
    setFooterConfig({ ...footerConfig, feature_badges: updatedBadges });
  };

  const handleAddCustomLink = () => {
    const current = footerConfig.custom_links || [];
    setFooterConfig({
      ...footerConfig,
      custom_links: [...current, { title: 'New Curated Link', url: '#' }],
    });
  };

  const handleUpdateCustomLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...(footerConfig.custom_links || [])];
    if (updated[index]) {
      updated[index] = { ...updated[index], [field]: value };
      setFooterConfig({ ...footerConfig, custom_links: updated });
    }
  };

  const handleDeleteCustomLink = (index: number) => {
    const updated = (footerConfig.custom_links || []).filter((_, i) => i !== index);
    setFooterConfig({ ...footerConfig, custom_links: updated });
  };

  const handleUpdateSocialLink = (field: string, value: string) => {
    setFooterConfig((prev) => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveWhatsappNumber = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingWhatsapp(true);
    setWhatsappSaveSuccess(false);
    try {
      const num = tempWhatsappNumber.trim();
      const updatedConfig = {
        ...footerConfig,
        contact_phone: num,
        social_links: {
          ...(footerConfig.social_links || {}),
          whatsapp: num,
        },
      };
      const updated = await api.updateFooterConfig(updatedConfig);
      setFooterConfig(updated);
      try {
        localStorage.setItem('artweb_footer_config', JSON.stringify(updated));
      } catch (e) {}
      setWhatsappSaveSuccess(true);
      setTimeout(() => {
        setWhatsappSaveSuccess(false);
        setShowWhatsappModal(false);
      }, 900);
    } catch (err: any) {
      alert(err.message || 'Failed to update WhatsApp number');
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const DEFAULT_ARTWORK_TABS: ArtworkTabsConfig = {
    tab1_title: 'Curatorial Note',
    tab2_title: 'Provenance & COA',
    tab2_intro: 'Every acquisition from our gallery includes a registered, tamper-evident Certificate of Authenticity (COA) signed directly by {artist} and counter-stamped by our Chief Curator.',
    tab2_point1: 'Official gallery archive serial registration number',
    tab2_point2: 'Archival acid-free cotton certificate backing',
    tab2_point3: 'Guaranteed museum provenance with transfer of ownership',

    tab3_title: 'White-Glove Shipping',
    tab3_intro: 'We ensure museum-grade protective packaging using shock-absorbing archival foam and custom wood casing.',
    tab3_point1: 'Complimentary insured door-to-door courier across India',
    tab3_point2: 'Estimated dispatch: 24 to 48 hours with live tracking',
    tab3_point3: 'Unboxing inspection and 14-day hassle-free returns',

    badge1_icon: 'shield-check',
    badge1_title: '100% Authentic',
    badge1_subtitle: 'Certificate included',
    badge2_icon: 'truck',
    badge2_title: 'Free Insured Transit',
    badge2_subtitle: 'Reinforced art crating',
    badge3_icon: 'rotate-ccw',
    badge3_title: '14-Day In-Home Trial',
    badge3_subtitle: 'Satisfaction guarantee',
  };

  const BADGE_ICON_OPTIONS = [
    { value: 'shield-check', label: '🛡️ Shield Check (Authentic / Safe)' },
    { value: 'truck', label: '🚚 Delivery Truck (Insured Transit)' },
    { value: 'rotate-ccw', label: '🔄 Rotate / Return (In-Home Trial)' },
    { value: 'award', label: '🏅 Award Ribbon (Museum Quality)' },
    { value: 'sparkles', label: '✨ Sparkles (Original Masterpiece)' },
    { value: 'check-circle', label: '✔️ Checkmark Circle (Verified)' },
    { value: 'package', label: '📦 Art Crate / Packaging' },
    { value: 'heart', label: '❤️ Heart (Collector Satisfaction)' },
    { value: 'lock', label: '🔒 Lock (Secure Transaction)' },
    { value: 'star', label: '⭐ Star (5-Star Provenance)' },
  ];

  const renderAdminBadgeIcon = (iconName?: string, defaultFallback: 'shield' | 'truck' | 'rotate' = 'shield', size = 16) => {
    const icon = (iconName || '').toLowerCase().trim();
    switch (icon) {
      case 'truck':
        return <Truck size={size} color="#0284c7" />;
      case 'rotate-ccw':
      case 'refresh':
      case 'return':
        return <RotateCcw size={size} color="#d97706" />;
      case 'award':
        return <Award size={size} color="#8b5cf6" />;
      case 'sparkles':
        return <Sparkles size={size} color="#eab308" />;
      case 'check-circle':
      case 'check':
        return <CheckCircle2 size={size} color="#059669" />;
      case 'heart':
        return <Heart size={size} color="#e11d48" />;
      case 'package':
        return <Package size={size} color="#4f46e5" />;
      case 'lock':
        return <Lock size={size} color="#475569" />;
      case 'star':
        return <Star size={size} color="#f59e0b" />;
      case 'shield':
      case 'shield-check':
        return <ShieldCheck size={size} color="#059669" />;
      default:
        if (defaultFallback === 'truck') return <Truck size={size} color="#0284c7" />;
        if (defaultFallback === 'rotate') return <RotateCcw size={size} color="#d97706" />;
        return <ShieldCheck size={size} color="#059669" />;
    }
  };

  const getArtworkTabs = (): ArtworkTabsConfig => {
    return {
      ...DEFAULT_ARTWORK_TABS,
      ...(footerConfig.social_links?.artwork_tabs || {}),
    };
  };

  const handleUpdateArtworkTab = (field: keyof ArtworkTabsConfig, value: string) => {
    const currentTabs = getArtworkTabs();
    const updatedTabs = { ...currentTabs, [field]: value };
    setFooterConfig((prev) => ({
      ...prev,
      social_links: {
        ...(prev.social_links || {}),
        artwork_tabs: updatedTabs,
      },
    }));
  };

  const handleSaveArtworkTabs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingFooter(true);
    try {
      const updated = await api.updateFooterConfig(footerConfig);
      setFooterConfig(updated);
      try {
        localStorage.setItem('artweb_footer_config', JSON.stringify(updated));
      } catch (e) {}
      alert('Artwork tabs & trust badges updated successfully!');
      setShowArtworkTabsModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save artwork tabs');
    } finally {
      setIsSavingFooter(false);
    }
  };

  // ===================== DASHBOARD DATE & TIME FILTER LOGIC =====================
  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'this_month': return 'This Month';
      case 'custom': return `Custom (${dashboardStartDate} ${dashboardStartTime} to ${dashboardEndDate} ${dashboardEndTime})`;
      default: return 'All Time';
    }
  };

  const isDateInRange = (
    dateStr: string | null | undefined,
    range: string,
    startDay?: string,
    startTime?: string,
    endDay?: string,
    endTime?: string
  ): boolean => {
    if (!dateStr || range === 'all') return true;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return true;

    const now = new Date();

    if (range === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return date >= todayStart && date <= todayEnd;
    }

    if (range === 'yesterday') {
      const yStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      const yEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      return date >= yStart && date <= yEnd;
    }

    if (range === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= sevenDaysAgo && date <= now;
    }

    if (range === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo && date <= now;
    }

    if (range === 'this_month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return date >= monthStart && date <= now;
    }

    if (range === 'custom') {
      if (startDay) {
        const [sYear, sMonth, sDate] = startDay.split('-').map(Number);
        const [sHour, sMin] = (startTime || '00:00').split(':').map(Number);
        const startDate = new Date(sYear, sMonth - 1, sDate, sHour || 0, sMin || 0, 0, 0);
        if (date < startDate) return false;
      }
      if (endDay) {
        const [eYear, eMonth, eDate] = endDay.split('-').map(Number);
        const [eHour, eMin] = (endTime || '23:59').split(':').map(Number);
        const endDate = new Date(eYear, eMonth - 1, eDate, eHour || 23, eMin || 59, 59, 999);
        if (date > endDate) return false;
      }
      return true;
    }

    return true;
  };

  const filteredDashboardInquiries = useMemo(() => {
    return inquiries.filter((inq) =>
      isDateInRange(
        inq.created_at,
        dashboardDateRange,
        dashboardStartDate,
        dashboardStartTime,
        dashboardEndDate,
        dashboardEndTime
      )
    );
  }, [inquiries, dashboardDateRange, dashboardStartDate, dashboardStartTime, dashboardEndDate, dashboardEndTime]);

  const dashboardFilteredStats = useMemo(() => {
    if (dashboardDateRange === 'all') {
      const totalRev = stats?.estimated_pipeline_value || inquiries.reduce((sum, i) => sum + (i.quoted_price || i.painting?.price || 0), 0) || 45231;
      return {
        totalRevenue: totalRev,
        totalInquiries: stats?.total_inquiries || inquiries.length,
        confirmedOrders: stats?.confirmed_orders || inquiries.filter((i) => i.status === 'confirmed' || i.status === 'completed').length,
        availablePaintings: stats?.available_paintings || paintings.length,
        inquiriesList: inquiries,
      };
    }

    const totalRevenue = filteredDashboardInquiries.reduce(
      (sum, inq) => sum + (inq.quoted_price || inq.painting?.price || 0),
      0
    );
    const confirmedOrders = filteredDashboardInquiries.filter(
      (inq) => inq.status === 'confirmed' || inq.status === 'completed'
    ).length;

    return {
      totalRevenue,
      totalInquiries: filteredDashboardInquiries.length,
      confirmedOrders,
      availablePaintings: paintings.length,
      inquiriesList: filteredDashboardInquiries,
    };
  }, [dashboardDateRange, filteredDashboardInquiries, inquiries, stats, paintings]);

  // ===================== EXCEL REPORT GENERATION HELPERS =====================
  const getSectionTitle = (sec: string) => {
    switch (sec) {
      case 'overview': return 'Overview';
      case 'products': return 'Products';
      case 'inquiries': return 'Orders & Inquiries';
      case 'users': return 'Customers';
      case 'categories': return 'Collections';
      case 'sections': return 'Store Sections';
      case 'banners': return 'Hero Banners';
      case 'testimonials': return 'Testimonials';
      case 'footer': return 'Footer Settings';
      case 'settings': return 'Settings';
      default: return 'Report';
    }
  };

  const getOverviewData = () => {
    return [
      { 'Metric': 'Selected Date Filter', 'Value': getDateRangeLabel(dashboardDateRange), 'Notes': dashboardDateRange === 'all' ? 'All time cumulative records' : `Filtered from ${dashboardStartDate} ${dashboardStartTime} to ${dashboardEndDate} ${dashboardEndTime}` },
      { 'Metric': 'Total Estimated Revenue', 'Value': `₹${dashboardFilteredStats.totalRevenue.toLocaleString('en-IN')}`, 'Notes': 'Aggregate value in selected period' },
      { 'Metric': 'Total Inquiries & Orders', 'Value': dashboardFilteredStats.totalInquiries, 'Notes': 'Inquiries matching selected period' },
      { 'Metric': 'Confirmed Orders', 'Value': dashboardFilteredStats.confirmedOrders, 'Notes': 'Processed customer orders in selected period' },
      { 'Metric': 'Total Products / Artworks', 'Value': stats?.total_paintings || paintings.length, 'Notes': 'Current catalog inventory size' },
      { 'Metric': 'Available Artworks', 'Value': stats?.available_paintings || paintings.filter((p) => p.status === 'available').length, 'Notes': 'Ready to purchase' },
      { 'Metric': 'Sold Artworks', 'Value': stats?.sold_paintings || paintings.filter((p) => p.status === 'sold').length, 'Notes': 'Completed artworks sold' },
      { 'Metric': 'Total Registered Users', 'Value': users.length, 'Notes': 'Customer and collector accounts' },
      { 'Metric': 'Active Collections', 'Value': categories.length, 'Notes': 'Curated art collections' },
      { 'Metric': 'Active Store Sections', 'Value': sections.length, 'Notes': 'Storefront curated sections' },
      { 'Metric': 'Active Hero Banners', 'Value': banners.filter((b) => b.is_active).length, 'Notes': 'Homepage showcase banners' },
      { 'Metric': 'Patron Testimonials', 'Value': testimonials.length, 'Notes': 'Collector reviews & quotes' },
    ];
  };

  const getProductsData = () => {
    return paintings.map((p) => {
      const categoryName = categories.find((c) => c.id === p.category_id)?.name || 'Uncategorized';
      const sectionName = sections.find((s) => s.id === p.section_id)?.name || 'None';
      return {
        'Product ID': p.id,
        'Title': p.title,
        'Artist': p.artist_name || 'Studio Curation',
        'Medium': p.medium || '',
        'Dimensions': p.dimensions || '',
        'Selling Price (₹)': p.price,
        'MRP (₹)': p.mrp || p.price,
        'Discount (₹)': p.mrp && p.mrp > p.price ? p.mrp - p.price : 0,
        'Status': p.status.toUpperCase(),
        'Category / Collection': categoryName,
        'Store Section': sectionName,
        'Is Featured': p.featured ? 'Yes' : 'No',
        'Is Framed': p.is_framed ? 'Yes' : 'No',
        'Primary Image URL': p.image_url || '',
        'Created Date': p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '',
      };
    });
  };

  const getInquiriesData = () => {
    return inquiries.map((inq) => ({
      'Inquiry ID': inq.id,
      'Inquiry Code': inq.inquiry_code,
      'Customer Name': inq.customer_name,
      'Phone': inq.customer_phone,
      'Email': inq.customer_email || '',
      'Artwork Title': inq.painting?.title || 'General Inquiry',
      'Artwork Price (₹)': inq.painting?.price || inq.quoted_price || 0,
      'Status': inq.status ? inq.status.toUpperCase() : 'NEW',
      'Customer Message': inq.message || '',
      'Delivery Address': inq.shipping_address || '',
      'Preferred Contact': inq.preferred_contact ? inq.preferred_contact.toUpperCase() : 'WHATSAPP',
      'Admin Notes': inquiryNotes[inq.id] || inq.admin_notes || '',
      'Order Date': inq.created_at ? new Date(inq.created_at).toLocaleString('en-IN') : '',
    }));
  };

  const getUsersData = () => {
    return users.map((u) => {
      const userInquiries = inquiries.filter(
        (inq) => (inq.customer_email && inq.customer_email.toLowerCase() === u.email?.toLowerCase()) || inq.user_id === u.id
      );
      return {
        'User ID': u.id,
        'Full Name': u.full_name,
        'Email': u.email,
        'Phone': u.phone || '',
        'Role': u.role.toUpperCase(),
        'Delivery Address': u.address || '',
        'City': u.city || '',
        'Total Orders / Inquiries': userInquiries.length,
        'Registered Date': u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '',
      };
    });
  };

  const getCategoriesData = () => {
    return categories.map((c) => {
      const totalPaintings = paintings.filter((p) => p.category_id === c.id).length;
      return {
        'Category ID': c.id,
        'Category Name': c.name,
        'Slug': c.slug,
        'Description': c.description || '',
        'Total Artworks': totalPaintings,
        'Cover Image URL': c.image_url || '',
        'Created Date': c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '',
      };
    });
  };

  const getSectionsData = () => {
    return sections.map((s) => {
      const totalPaintings = paintings.filter((p) => p.section_id === s.id).length;
      return {
        'Section ID': s.id,
        'Section Name': s.name,
        'Slug': s.slug,
        'Description': s.description || '',
        'Display Order': s.display_order,
        'Is Active': s.is_active ? 'Active' : 'Inactive',
        'Total Artworks': totalPaintings,
        'Created Date': s.created_at ? new Date(s.created_at).toLocaleDateString('en-IN') : '',
      };
    });
  };

  const getBannersData = () => {
    return banners.map((b) => ({
      'Banner ID': b.id,
      'Tag': b.tag,
      'Title': b.title,
      'Description': b.description,
      'Button Text': b.button_text,
      'Artist Name': b.artist_name,
      'Price (₹)': b.price,
      'Display Order': b.display_order,
      'Is Active': b.is_active ? 'Active' : 'Inactive',
      'Image URL': b.image_url,
      'Created Date': b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : '',
    }));
  };

  const getTestimonialsData = () => {
    return testimonials.map((t) => ({
      'Testimonial ID': t.id,
      'Patron Name': t.name,
      'Location': t.location || '',
      'Rating (Stars)': `${t.rating} / 5`,
      'Quote / Review': t.quote,
      'Display Order': t.display_order,
      'Is Active': t.is_active ? 'Active' : 'Inactive',
      'Created Date': t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : '',
    }));
  };

  const getFooterData = () => {
    return [
      { 'Setting Field': 'Brand Title', 'Configured Value': footerConfig.brand_name || '' },
      { 'Setting Field': 'Brand Subtitle / Tagline', 'Configured Value': footerConfig.brand_subtitle || '' },
      { 'Setting Field': 'Brand Description', 'Configured Value': footerConfig.brand_description || '' },
      { 'Setting Field': 'Studio Location', 'Configured Value': footerConfig.studio_location || '' },
      { 'Setting Field': 'Concierge Phone / WhatsApp', 'Configured Value': footerConfig.contact_phone || '' },
      { 'Setting Field': 'Advisory Email', 'Configured Value': footerConfig.contact_email || '' },
      { 'Setting Field': 'Copyright Notice', 'Configured Value': footerConfig.copyright_text || '' },
      { 'Setting Field': 'Social Section Title', 'Configured Value': footerConfig.social_links?.section_title || 'Connect With Us' },
      { 'Setting Field': 'Instagram URL', 'Configured Value': footerConfig.social_links?.instagram || '' },
      { 'Setting Field': 'Facebook URL', 'Configured Value': footerConfig.social_links?.facebook || '' },
      { 'Setting Field': 'WhatsApp URL / Number', 'Configured Value': footerConfig.social_links?.whatsapp || '' },
      { 'Setting Field': 'Twitter / X URL', 'Configured Value': footerConfig.social_links?.twitter || '' },
      { 'Setting Field': 'YouTube Channel URL', 'Configured Value': footerConfig.social_links?.youtube || '' },
      { 'Setting Field': 'Newsletter Title', 'Configured Value': footerConfig.newsletter_title || '' },
      { 'Setting Field': 'Newsletter Description', 'Configured Value': footerConfig.newsletter_description || '' },
      { 'Setting Field': 'Newsletter Placeholder', 'Configured Value': footerConfig.newsletter_placeholder || '' },
    ];
  };

  const exportCurrentSectionReport = (targetSection?: string) => {
    try {
      const current = targetSection || navSection;
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toISOString().split('T')[0];

      let filename = '';
      switch (current) {
        case 'overview': {
          const wsKPI = XLSX.utils.json_to_sheet(getOverviewData());
          XLSX.utils.book_append_sheet(wb, wsKPI, 'Store KPIs');
          const wsRecent = XLSX.utils.json_to_sheet(getInquiriesData().slice(0, 50));
          XLSX.utils.book_append_sheet(wb, wsRecent, 'Recent Activity');
          filename = `Store_Overview_Report_${dateStr}.xlsx`;
          break;
        }
        case 'products': {
          const ws = XLSX.utils.json_to_sheet(getProductsData());
          XLSX.utils.book_append_sheet(wb, ws, 'Products Inventory');
          filename = `Products_Catalog_Report_${dateStr}.xlsx`;
          break;
        }
        case 'inquiries': {
          const ws = XLSX.utils.json_to_sheet(getInquiriesData());
          XLSX.utils.book_append_sheet(wb, ws, 'Orders & Inquiries');
          filename = `Orders_Inquiries_Report_${dateStr}.xlsx`;
          break;
        }
        case 'users': {
          const ws = XLSX.utils.json_to_sheet(getUsersData());
          XLSX.utils.book_append_sheet(wb, ws, 'Customers & Accounts');
          filename = `Customers_Accounts_Report_${dateStr}.xlsx`;
          break;
        }
        case 'categories': {
          const ws = XLSX.utils.json_to_sheet(getCategoriesData());
          XLSX.utils.book_append_sheet(wb, ws, 'Collections');
          filename = `Collections_Categories_Report_${dateStr}.xlsx`;
          break;
        }
        case 'sections': {
          const ws = XLSX.utils.json_to_sheet(getSectionsData());
          XLSX.utils.book_append_sheet(wb, ws, 'Store Sections');
          filename = `Store_Sections_Report_${dateStr}.xlsx`;
          break;
        }
        case 'banners': {
          const ws = XLSX.utils.json_to_sheet(getBannersData());
          XLSX.utils.book_append_sheet(wb, ws, 'Hero Banners');
          filename = `Hero_Banners_Report_${dateStr}.xlsx`;
          break;
        }
        case 'testimonials': {
          const ws = XLSX.utils.json_to_sheet(getTestimonialsData());
          XLSX.utils.book_append_sheet(wb, ws, 'Patron Testimonials');
          filename = `Patron_Testimonials_Report_${dateStr}.xlsx`;
          break;
        }
        case 'footer': {
          const ws = XLSX.utils.json_to_sheet(getFooterData());
          XLSX.utils.book_append_sheet(wb, ws, 'Footer Settings');
          filename = `Footer_Configuration_Report_${dateStr}.xlsx`;
          break;
        }
        default: {
          const ws = XLSX.utils.json_to_sheet(getOverviewData());
          XLSX.utils.book_append_sheet(wb, ws, 'Overview');
          filename = `Store_Report_${dateStr}.xlsx`;
          break;
        }
      }

      XLSX.writeFile(wb, filename);
    } catch (err: any) {
      alert('Failed to generate Excel report: ' + (err.message || err));
    }
  };

  const exportMasterStoreReport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const dateStr = new Date().toISOString().split('T')[0];

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getOverviewData()), 'Store KPIs');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getProductsData()), 'Products Catalog');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getInquiriesData()), 'Orders & Inquiries');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getUsersData()), 'Customers');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getCategoriesData()), 'Collections');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getSectionsData()), 'Store Sections');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getBannersData()), 'Hero Banners');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getTestimonialsData()), 'Testimonials');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getFooterData()), 'Footer Settings');

      XLSX.writeFile(wb, `Complete_Store_Master_Report_${dateStr}.xlsx`);
    } catch (err: any) {
      alert('Failed to generate master store report: ' + (err.message || err));
    }
  };

  const handleAddSectionPrompt = async () => {
    const secName = window.prompt('Enter new store section name (e.g. Curators Choice, Trending Now):');
    if (!secName || !secName.trim()) return;

    try {
      const created = await api.createSection({
        name: secName.trim(),
        display_order: sections.length + 1,
        is_active: true,
      });
      setSections((prev) => [...prev, created]);
      setFormData((prev) => ({ ...prev, section_id: created.id.toString() }));
      alert(`Store section "${created.name}" created and selected!`);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create store section');
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setFormData((prev) => ({ ...prev, image_url: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileUploadSlot = async (e: React.ChangeEvent<HTMLInputElement>, slot: 'image_url_2' | 'image_url_3') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setFormData((prev) => ({ ...prev, [slot]: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePainting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.image_url) {
      alert('Please fill out all required fields (Title, Price, Artwork Image)');
      return;
    }

    try {
      const payload: any = {
        title: formData.title.trim(),
        artist_name: formData.artist_name.trim() || 'Master Artist',
        description: formData.description.trim(),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        section_id: formData.section_id ? parseInt(formData.section_id) : null,
        medium: formData.medium.trim(),
        dimensions: formData.dimensions.trim(),
        price: parseFloat(formData.price),
        mrp: formData.mrp && !isNaN(parseFloat(formData.mrp)) ? parseFloat(formData.mrp) : null,
        currency: 'INR',
        image_url: formData.image_url.trim(),
        image_url_2: formData.image_url_2.trim() || null,
        image_url_3: formData.image_url_3.trim() || null,
        is_framed: formData.is_framed,
        status: formData.status,
        featured: formData.featured,
      };

      if (editingPainting) {
        await api.updatePainting(editingPainting.id, payload);
      } else {
        await api.createPainting(payload);
      }

      setShowPaintingModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save painting');
    }
  };

  const handleDeletePainting = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this artwork?')) {
      return;
    }
    try {
      setPaintings((prev) => prev.filter((p) => p.id !== id));
      await api.deletePainting(id);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete painting');
      loadAllAdminData();
    }
  };

  const handleToggleProductStatus = async (painting: Painting) => {
    const newStatus = painting.status === 'inactive' ? 'available' : 'inactive';
    try {
      await api.updatePainting(painting.id, { status: newStatus });
      setPaintings((prev) =>
        prev.map((item) => (item.id === painting.id ? { ...item, status: newStatus } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update artwork status');
    }
  };

  const handleToggleUserActive = async (targetUser: User) => {
    try {
      const updated = await api.toggleUserActive(targetUser.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: updated.is_active } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user account status');
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (!window.confirm(`Are you sure you want to delete user account "${targetUser.full_name}" (${targetUser.email})? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete user account');
    }
  };

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      const updated = await api.updateMe({
        full_name: adminProfileForm.full_name.trim(),
        email: adminProfileForm.email.trim(),
        phone: adminProfileForm.phone.trim() || undefined,
        address: adminProfileForm.address.trim() || undefined,
        city: adminProfileForm.city.trim() || undefined,
      });
      setAdminUser(updated);
      setProfileSuccessMsg('Admin profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
      loadAllAdminData();
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update admin profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.changePassword({
        old_password: passwordForm.old_password.trim() || undefined,
        new_password: passwordForm.new_password,
      });
      setPasswordSuccessMsg('Admin password updated successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Banner Handlers
  const openAddBannerModal = () => {
    setEditingBanner(null);
    setBannerFormData({
      tag: 'ABSTRACT & MODERN CURATION',
      title: '',
      description: '',
      button_text: 'SHOP NOW',
      image_url: '',
      artist_name: '',
      price: '',
      circle_color: '#eedcd5',
      bg_color: '#f3f2ee',
      text_color: '#ffffff',
      is_active: true,
      display_order: banners.length + 1,
    });
    setShowBannerModal(true);
  };

  const openEditBannerModal = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      tag: banner.tag,
      title: banner.title,
      description: banner.description,
      button_text: banner.button_text,
      image_url: banner.image_url,
      artist_name: banner.artist_name,
      price: banner.price.toString(),
      circle_color: banner.circle_color || '#eedcd5',
      bg_color: banner.bg_color || '#f3f2ee',
      text_color: banner.text_color || '#ffffff',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setShowBannerModal(true);
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setBannerFormData((prev) => ({ ...prev, image_url: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload banner image file');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tag: bannerFormData.tag.trim(),
        title: bannerFormData.title.trim(),
        description: bannerFormData.description.trim(),
        button_text: bannerFormData.button_text.trim() || 'SHOP NOW',
        image_url: bannerFormData.image_url.trim(),
        artist_name: bannerFormData.artist_name.trim(),
        price: parseFloat(bannerFormData.price) || 0,
        circle_color: bannerFormData.circle_color.trim() || '#eedcd5',
        bg_color: bannerFormData.bg_color.trim() || '#f3f2ee',
        text_color: bannerFormData.text_color?.trim() || '#ffffff',
        is_active: bannerFormData.is_active,
        display_order: Number(bannerFormData.display_order) || 0,
      };

      if (editingBanner) {
        const updated = await api.updateBanner(editingBanner.id, payload);
        setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      } else {
        const created = await api.createBanner(payload);
        setBanners((prev) => [...prev, created]);
      }

      setShowBannerModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    }
  };

  const handleToggleBannerActive = async (bannerId: number) => {
    try {
      const updated = await api.toggleBannerActive(bannerId);
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle banner status');
    }
  };

  const handleDeleteBanner = async (bannerId: number) => {
    if (!window.confirm('Are you sure you want to delete this hero banner?')) {
      return;
    }
    try {
      await api.deleteBanner(bannerId);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  // Showcase Marquee Handlers
  const openAddShowcaseModal = () => {
    setEditingShowcase(null);
    setShowcaseFormData({
      image_url: '',
      title: '',
      tag: 'FEATURED',
      description: '',
      display_order: showcases.length + 1,
      is_active: true,
    });
    setShowShowcaseModal(true);
  };

  const openEditShowcaseModal = (item: ShowcaseItem) => {
    setEditingShowcase(item);
    setShowcaseFormData({
      image_url: item.image_url,
      title: item.title || '',
      tag: item.tag || '',
      description: item.description || '',
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setShowShowcaseModal(true);
  };

  const handleShowcaseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingShowcaseImage(true);
    try {
      const res = await api.uploadImage(file);
      const fullUrl = res.url.startsWith('http') ? res.url : `${BACKEND_URL}${res.url}`;
      setShowcaseFormData((prev) => ({ ...prev, image_url: fullUrl }));
    } catch (err: any) {
      alert(err.message || 'Failed to upload showcase image file');
    } finally {
      setUploadingShowcaseImage(false);
    }
  };

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseFormData.image_url.trim()) {
      alert('Please upload or specify an image URL for the showcase photo.');
      return;
    }
    try {
      const payload = {
        image_url: showcaseFormData.image_url.trim(),
        title: showcaseFormData.title.trim() || undefined,
        tag: showcaseFormData.tag.trim() || undefined,
        description: showcaseFormData.description.trim() || undefined,
        display_order: Number(showcaseFormData.display_order) || 1,
        is_active: showcaseFormData.is_active,
      };

      if (editingShowcase) {
        const updated = await api.updateShowcaseItem(editingShowcase.id, payload);
        setShowcases((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      } else {
        const created = await api.createShowcaseItem(payload);
        setShowcases((prev) => [...prev, created]);
      }

      setShowShowcaseModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save showcase item');
    }
  };

  const handleToggleShowcaseActive = async (itemId: number) => {
    try {
      const updated = await api.toggleShowcaseItemActive(itemId);
      setShowcases((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle showcase visibility');
    }
  };

  const handleDeleteShowcase = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this showcase photo?')) {
      return;
    }
    try {
      await api.deleteShowcaseItem(itemId);
      setShowcases((prev) => prev.filter((s) => s.id !== itemId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete showcase item');
    }
  };

  const handleStatusChange = async (inquiryId: number, newStatus: string) => {
    try {
      const note = inquiryNotes[inquiryId] || '';
      await api.updateInquiryStatus(inquiryId, {
        status: newStatus,
        admin_notes: note,
      });
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update inquiry status');
    }
  };

  const handleSaveNote = async (inquiryId: number, currentStatus: string) => {
    try {
      await api.updateInquiryStatus(inquiryId, {
        status: currentStatus,
        admin_notes: inquiryNotes[inquiryId] || '',
      });
      alert('Curator notes updated successfully!');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredPaintings = paintings.filter((p) => {
    const catObj = categories.find((c) => c.id === p.category_id);
    const catNameStr = catObj ? catObj.name : (typeof p.category === 'object' && p.category ? p.category.name : (typeof p.category === 'string' ? p.category : ''));
    if (productCategoryFilter !== 'all') {
      if (catNameStr !== productCategoryFilter && String(p.category_id) !== productCategoryFilter) {
        return false;
      }
    }
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    const catNameLower = catNameStr.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.artist_name && p.artist_name.toLowerCase().includes(term)) ||
      catNameLower.includes(term) ||
      `sbp-${p.id}`.includes(term) ||
      String(p.id).includes(term)
    );
  });

  const filteredInquiries = inquiries.filter((inq) => {
    if (!inquiryStatusFilter) return true;
    return inq.status === inquiryStatusFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term)) ||
      (u.city && u.city.toLowerCase().includes(term))
    );
  });

  const [overviewMetric, setOverviewMetric] = useState<'revenue' | 'inquiries'>('revenue');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Dynamic monthly overview data calculated directly from real store inquiries
  const monthlyOverviewData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyTotals = monthNames.map((name, monthIndex) => {
      // Find inquiries in this month
      const monthInquiries = inquiries.filter((inq) => {
        if (!inq.created_at) return false;
        try {
          const d = new Date(inq.created_at);
          return d.getMonth() === monthIndex;
        } catch {
          return false;
        }
      });

      const revenue = monthInquiries.reduce((sum, inq) => sum + (Number(inq.quoted_price) || 0), 0);
      const count = monthInquiries.length;

      return {
        month: name,
        monthIndex,
        revenue,
        count,
      };
    });

    const maxRevenue = Math.max(...monthlyTotals.map((m) => m.revenue), 0);
    const maxCount = Math.max(...monthlyTotals.map((m) => m.count), 0);

    // Dynamic clean ceiling for Y-axis
    let chartMaxRevenue = 50000;
    if (maxRevenue > 0) {
      if (maxRevenue <= 15000) chartMaxRevenue = 20000;
      else if (maxRevenue <= 40000) chartMaxRevenue = 50000;
      else if (maxRevenue <= 80000) chartMaxRevenue = 100000;
      else chartMaxRevenue = Math.ceil((maxRevenue * 1.25) / 25000) * 25000;
    }

    const chartMaxCount = Math.max(10, Math.ceil(maxCount * 1.3));

    return {
      monthlyTotals,
      maxRevenue,
      chartMaxRevenue,
      chartMaxCount,
    };
  }, [inquiries]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#fbfbfb',
      color: '#09090b',
      fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* 1. Left Sidebar (Shadcn UI style - Fixed/Static on desktop, offcanvas on mobile) */}
      <aside
        className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '240px',
          height: '100vh',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e4e4e7',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* Workspace Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 18px',
            borderBottom: '1px solid #e5e7eb',
            marginBottom: '16px',
          }}>
            {footerConfig?.brand_logo_url ? (
              <img
                src={footerConfig.brand_logo_url}
                alt={footerConfig.brand_name || 'Logo'}
                style={{
                  height: '28px',
                  maxWidth: '38px',
                  objectFit: 'contain',
                  borderRadius: '3px',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '2px',
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                flexShrink: 0,
              }}>
                ✦
              </div>
            )}
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: '14px',
                color: '#000000',
                letterSpacing: '-0.01em',
                fontFamily: "'Playfair Display', Georgia, serif",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '160px',
              }}>
                {footerConfig?.brand_name || 'ArtGallery'}
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                Enterprise Portal
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* 1. OVERVIEW */}
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', padding: '10px 12px 4px' }}>
              OVERVIEW
            </div>
            <button
              type="button"
              onClick={() => {
                navigate('/admin');
                setActiveSubTab('overview');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'overview' ? '#000000' : 'transparent',
                color: navSection === 'overview' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'overview' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>

            {/* 2. CATALOG */}
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', padding: '14px 12px 4px' }}>
              CATALOG
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'products' ? '#000000' : 'transparent',
                color: navSection === 'products' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'products' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Package size={15} />
              Products
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'categories' ? '#000000' : 'transparent',
                color: navSection === 'categories' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'categories' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <FolderTree size={15} />
              Collections
            </button>

            {/* 3. SALES & CUSTOMERS */}
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', padding: '14px 12px 4px' }}>
              SALES & CUSTOMERS
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/inquiries')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'inquiries' ? '#000000' : 'transparent',
                color: navSection === 'inquiries' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'inquiries' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <ClipboardList size={15} />
              Orders
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'users' ? '#000000' : 'transparent',
                color: navSection === 'users' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'users' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={15} />
              Customers
            </button>

            {/* 4. STOREFRONT & CMS */}
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', padding: '14px 12px 4px' }}>
              STOREFRONT & CMS
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/banners')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'banners' ? '#000000' : 'transparent',
                color: navSection === 'banners' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'banners' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <ImageIcon size={15} />
              Banners
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/showcase')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'showcase' ? '#000000' : 'transparent',
                color: navSection === 'showcase' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'showcase' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={15} />
              Showcase Marquee
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/sections')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'sections' ? '#000000' : 'transparent',
                color: navSection === 'sections' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'sections' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={15} />
              Sections
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/testimonials')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'testimonials' ? '#000000' : 'transparent',
                color: navSection === 'testimonials' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'testimonials' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Quote size={15} />
              Testimonials
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/footer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'footer' ? '#000000' : 'transparent',
                color: navSection === 'footer' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'footer' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <PanelBottom size={15} />
              Footer
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '2px',
                border: 'none',
                backgroundColor: navSection === 'settings' ? '#000000' : 'transparent',
                color: navSection === 'settings' ? '#ffffff' : '#374151',
                fontWeight: navSection === 'settings' ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Settings size={15} />
              Settings
            </button>
          </div>
        </div>

        {/* Bottom: Sign Out button */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onBackToStore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '2px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#374151',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f4f4f5';
              e.currentTarget.style.color = '#000000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area (Scrolls independently while sidebar is static) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Top Navbar (Sticky at top of content area) */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid #e4e4e7',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          {/* Breadcrumb / Search & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="show-on-mobile admin-mobile-toggle"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                color: '#09090b',
                padding: 0,
              }}
              aria-label="Toggle Navigation"
            >
              {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div className="hide-on-mobile" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f4f4f5',
              padding: '6px 14px',
              borderRadius: '6px',
              width: '240px',
            }}>
              <Search size={14} color="#71717a" />
              <input
                type="text"
                placeholder="Search..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#09090b',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              <kbd style={{
                fontSize: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '3px',
                padding: '1px 5px',
                color: '#71717a',
              }}>
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Top Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={openAddPaintingModal}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} /> Add Artwork
            </button>

            <button
              onClick={loadAllAdminData}
              title="Refresh Data"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                border: '1px solid #e4e4e7',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#09090b',
              }}
            >
              <RefreshCw size={14} />
            </button>

            {/* User Avatar (Redirects to Admin Profile & Settings) */}
            <div
              onClick={() => navigate('/admin/settings')}
              title="Admin Profile & Settings (Click to manage)"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#000000',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                border: '1px solid #000000',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {adminUser?.full_name
                ? adminUser.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'AD'}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="admin-content-padding" style={{ padding: '32px 36px', overflowY: 'auto', flex: 1 }}>
          {/* Dynamic Section Header */}
          {navSection !== 'products' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#000000',
                  letterSpacing: '-0.01em',
                  marginBottom: '4px',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {navSection === 'overview' && 'Dashboard'}
                  {navSection === 'inquiries' && 'Orders & Inquiries'}
                  {navSection === 'users' && 'Customers & Accounts'}
                  {navSection === 'settings' && 'Store Settings'}
                  {navSection === 'banners' && 'Hero Banners'}
                  {navSection === 'sections' && 'Store Sections'}
                  {navSection === 'categories' && 'Collections'}
                  {navSection === 'testimonials' && 'Patron Testimonials'}
                  {navSection === 'footer' && 'Footer Configuration'}
                </h1>

                {navSection === 'overview' ? (
                  /* Overview Pill */
                  <div style={{
                    display: 'inline-flex',
                    backgroundColor: '#f4f4f5',
                    padding: '3px',
                    borderRadius: '2px',
                    marginTop: '8px',
                  }}>
                    <div
                      style={{
                        padding: '6px 14px',
                        borderRadius: '2px',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '12.5px',
                      }}
                    >
                      Overview
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {navSection === 'inquiries' && 'Review incoming client orders, inquiries, and customer requests.'}
                    {navSection === 'users' && 'View all registered customers, collectors, and admins stored in PostgreSQL.'}
                    {navSection === 'settings' && 'Database connection and currency configuration.'}
                    {navSection === 'banners' && 'Manage promotional hero banners and storefront visuals.'}
                    {navSection === 'sections' && 'Curate storefront sections and featured highlights.'}
                    {navSection === 'categories' && 'Organize artwork collections, styles, and taxonomies.'}
                    {navSection === 'testimonials' && 'Manage patron reviews and quotes displayed on the storefront.'}
                    {navSection === 'footer' && 'Configure global storefront footer content and brand badges.'}
                  </p>
                )}
              </div>

              {/* Dynamic Excel Report Generation Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {navSection === 'overview' ? (
                  /* Dashboard Overview: Generate All Reports for all sections */
                  <button
                    type="button"
                    onClick={exportMasterStoreReport}
                    title="Export all sections in a single multi-sheet Excel workbook"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#27272a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#18181b';
                    }}
                  >
                    <Download size={14} color="#ffffff" />
                    <span>Generate All Reports (.xlsx)</span>
                  </button>
                ) : (
                  /* Other Sections: Generate ONLY this particular section's report */
                  <button
                    type="button"
                    onClick={() => exportCurrentSectionReport(navSection)}
                    title={`Export ${getSectionTitle(navSection)} to Excel (.xlsx)`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                      e.currentTarget.style.borderColor = '#4ade80';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#86efac';
                    }}
                  >
                    <FileSpreadsheet size={15} color="#16a34a" />
                    <span>Export {getSectionTitle(navSection)} (.xlsx)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 1: OVERVIEW (Exact Shadcn Layout from Screenshot) */}
          {navSection === 'overview' && (
            <div>
              {/* Dashboard Date & Time Filter Bar */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '6px',
                padding: '16px 20px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}>
                  {/* Left: Filter Title & Quick Presets */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#09090b', fontWeight: 700, fontSize: '13px' }}>
                      <Calendar size={15} color="#09090b" />
                      <span>Date & Time Filter:</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'all', label: 'All Time' },
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: '7days', label: 'Last 7 Days' },
                        { id: '30days', label: 'Last 30 Days' },
                        { id: 'this_month', label: 'This Month' },
                        { id: 'custom', label: 'Custom Range' },
                      ].map((item) => {
                        const isActive = dashboardDateRange === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDashboardDateRange(item.id as any)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: isActive ? 700 : 500,
                              backgroundColor: isActive ? '#09090b' : '#f4f4f5',
                              color: isActive ? '#ffffff' : '#3f3f46',
                              border: isActive ? '1px solid #09090b' : '1px solid #e4e4e7',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Filter Summary Tag */}
                  <div style={{
                    fontSize: '12px',
                    color: '#3f3f46',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e4e4e7',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Clock size={12} color="#71717a" />
                    <span>
                      {dashboardDateRange === 'all'
                        ? 'All Time Cumulated'
                        : `${getDateRangeLabel(dashboardDateRange)} (${dashboardFilteredStats.totalInquiries} inquiries)`}
                    </span>
                  </div>
                </div>

                {/* Custom Date & Time Inputs */}
                {dashboardDateRange === 'custom' && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed #e4e4e7',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}>
                    {/* From Date & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#52525b' }}>From:</span>
                      <input
                        type="date"
                        value={dashboardStartDate}
                        onChange={(e) => setDashboardStartDate(e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 8px',
                          border: '1px solid #d4d4d8',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#09090b',
                          outline: 'none',
                        }}
                      />
                      <input
                        type="time"
                        value={dashboardStartTime}
                        onChange={(e) => setDashboardStartTime(e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 8px',
                          border: '1px solid #d4d4d8',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#09090b',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* To Date & Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#52525b' }}>To:</span>
                      <input
                        type="date"
                        value={dashboardEndDate}
                        onChange={(e) => setDashboardEndDate(e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 8px',
                          border: '1px solid #d4d4d8',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#09090b',
                          outline: 'none',
                        }}
                      />
                      <input
                        type="time"
                        value={dashboardEndTime}
                        onChange={(e) => setDashboardEndTime(e.target.value)}
                        style={{
                          fontSize: '12px',
                          padding: '5px 8px',
                          border: '1px solid #d4d4d8',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: '#09090b',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Quick Reset */}
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        setDashboardStartDate(d.toISOString().slice(0, 10));
                        setDashboardStartTime('00:00');
                        setDashboardEndDate(new Date().toISOString().slice(0, 10));
                        setDashboardEndTime('23:59');
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #e4e4e7',
                        color: '#71717a',
                        cursor: 'pointer',
                      }}
                    >
                      Reset Range
                    </button>
                  </div>
                )}
              </div>

              {/* 4 Metric Cards in a Row */}
              <div className="responsive-admin-kpi-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}>
                {/* 1. Total Revenue Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '20px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#71717a', textTransform: 'uppercase' }}>TOTAL REVENUE</span>
                    <span style={{ color: '#71717a', fontSize: '13px' }}>₹</span>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#000000', letterSpacing: '-0.01em', marginBottom: '4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {formatPrice(dashboardFilteredStats.totalRevenue)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#000000', fontWeight: 700 }}>
                      {dashboardDateRange === 'all' ? '+20.1%' : getDateRangeLabel(dashboardDateRange)}
                    </span> {dashboardDateRange === 'all' ? 'from last month' : 'period'}
                  </div>
                </div>

                {/* 2. Subscriptions / Inquiries Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '20px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#71717a', textTransform: 'uppercase' }}>INQUIRIES CRM</span>
                    <Users size={14} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#000000', letterSpacing: '-0.01em', marginBottom: '4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    +{dashboardFilteredStats.totalInquiries}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#000000', fontWeight: 700 }}>
                      {dashboardDateRange === 'all' ? '+180.1%' : `${dashboardFilteredStats.totalInquiries} in range`}
                    </span> {dashboardDateRange === 'all' ? 'from last month' : ''}
                  </div>
                </div>

                {/* 3. Sales / Confirmed Orders Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '20px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#71717a', textTransform: 'uppercase' }}>SALES ORDERS</span>
                    <CreditCard size={14} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#000000', letterSpacing: '-0.01em', marginBottom: '4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    +{dashboardFilteredStats.confirmedOrders}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#000000', fontWeight: 700 }}>
                      {dashboardDateRange === 'all' ? '+19%' : `${dashboardFilteredStats.confirmedOrders} confirmed`}
                    </span> {dashboardDateRange === 'all' ? 'from last month' : 'orders'}
                  </div>
                </div>

                {/* 4. Active Now / In Stock Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '20px 18px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#71717a', textTransform: 'uppercase' }}>AVAILABLE ART</span>
                    <Activity size={14} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#000000', letterSpacing: '-0.01em', marginBottom: '4px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    +{dashboardFilteredStats.availablePaintings}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#000000', fontWeight: 700 }}>In Stock</span> ready to ship
                  </div>
                </div>
              </div>

              {/* Bottom Cards: Left (Overview Bar Chart) + Right (Recent Sales) */}
              <div className="responsive-admin-overview-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.1fr',
                gap: '20px',
                alignItems: 'stretch',
              }}>
                {/* Left Card: Overview Bar Chart */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                        Overview
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#71717a', margin: '3px 0 0 0' }}>
                        Monthly {overviewMetric === 'revenue' ? 'Sales Revenue' : 'Inquiries CRM Volume'}
                      </p>
                    </div>

                    {/* Metric Toggle: Revenue vs Inquiries */}
                    <div style={{ display: 'flex', backgroundColor: '#f4f4f5', padding: '3px', borderRadius: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setOverviewMetric('revenue')}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: overviewMetric === 'revenue' ? '#ffffff' : 'transparent',
                          color: overviewMetric === 'revenue' ? '#09090b' : '#71717a',
                          boxShadow: overviewMetric === 'revenue' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Revenue (₹)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOverviewMetric('inquiries')}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: overviewMetric === 'inquiries' ? '#ffffff' : 'transparent',
                          color: overviewMetric === 'inquiries' ? '#09090b' : '#71717a',
                          boxShadow: overviewMetric === 'inquiries' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        Inquiries (Count)
                      </button>
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    height: '330px',
                    alignItems: 'flex-end',
                    gap: '16px',
                    position: 'relative',
                    paddingTop: '24px',
                  }}>
                    {/* Y-axis labels */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '280px',
                      fontSize: '11px',
                      color: '#71717a',
                      paddingRight: '8px',
                      textAlign: 'right',
                      minWidth: '60px',
                    }}>
                      {overviewMetric === 'revenue' ? (
                        <>
                          <span>₹{(monthlyOverviewData.chartMaxRevenue).toLocaleString('en-IN')}</span>
                          <span>₹{(Math.round(monthlyOverviewData.chartMaxRevenue * 0.75)).toLocaleString('en-IN')}</span>
                          <span>₹{(Math.round(monthlyOverviewData.chartMaxRevenue * 0.5)).toLocaleString('en-IN')}</span>
                          <span>₹{(Math.round(monthlyOverviewData.chartMaxRevenue * 0.25)).toLocaleString('en-IN')}</span>
                          <span>₹0</span>
                        </>
                      ) : (
                        <>
                          <span>{monthlyOverviewData.chartMaxCount}</span>
                          <span>{Math.round(monthlyOverviewData.chartMaxCount * 0.75)}</span>
                          <span>{Math.round(monthlyOverviewData.chartMaxCount * 0.5)}</span>
                          <span>{Math.round(monthlyOverviewData.chartMaxCount * 0.25)}</span>
                          <span>0</span>
                        </>
                      )}
                    </div>

                    {/* Bars Grid */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: '280px',
                      borderBottom: '1px solid #e5e7eb',
                      gap: '8px',
                      position: 'relative',
                    }}>
                      {/* Grid background guidelines */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />

                      {monthlyOverviewData.monthlyTotals.map((m, idx) => {
                        const val = overviewMetric === 'revenue' ? m.revenue : m.count;
                        const maxVal = overviewMetric === 'revenue' ? monthlyOverviewData.chartMaxRevenue : monthlyOverviewData.chartMaxCount;
                        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                        const isHovered = hoveredMonthIndex === idx;

                        return (
                          <div
                            key={m.month}
                            onMouseEnter={() => setHoveredMonthIndex(idx)}
                            onMouseLeave={() => setHoveredMonthIndex(null)}
                            style={{
                              flex: 1,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              position: 'relative',
                              cursor: 'pointer',
                            }}
                          >
                            {/* Hover Tooltip */}
                            {isHovered && (
                              <div style={{
                                position: 'absolute',
                                top: '-36px',
                                zIndex: 10,
                                backgroundColor: '#09090b',
                                color: '#ffffff',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                pointerEvents: 'none',
                              }}>
                                {m.month}: ₹{m.revenue.toLocaleString('en-IN')} ({m.count} inquiries)
                              </div>
                            )}

                            {/* The Bar */}
                            <div
                              style={{
                                width: '80%',
                                maxWidth: '30px',
                                minWidth: '12px',
                                height: val > 0 ? `${Math.max(6, pct)}%` : '3px',
                                backgroundColor: isHovered ? '#1b3b2b' : (val > 0 ? '#09090b' : '#e4e4e7'),
                                borderRadius: '4px 4px 0 0',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            />
                            {/* Month Label */}
                            <span style={{
                              fontSize: '11px',
                              color: isHovered ? '#09090b' : (val > 0 ? '#18181b' : '#a1a1aa'),
                              fontWeight: isHovered || val > 0 ? 700 : 500,
                              marginTop: '8px',
                            }}>
                              {m.month}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Card: Recent Sales / Recent Inquiries */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                      Recent Inquiries & Orders
                    </h3>
                    <p style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                      {dashboardDateRange === 'all'
                        ? `You have ${inquiries.length} total inquiries recorded.`
                        : `Showing ${dashboardFilteredStats.inquiriesList.length} inquiries for ${getDateRangeLabel(dashboardDateRange)}.`}
                    </p>
                  </div>

                  {/* List of Recent Sales with sleek scrolling */}
                  <div
                    className="custom-admin-scrollbar"
                    style={{
                      flex: 1,
                      maxHeight: '330px',
                      overflowY: 'auto',
                      paddingRight: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {dashboardFilteredStats.inquiriesList.length > 0 ? (
                      dashboardFilteredStats.inquiriesList.map((inq) => {
                        const initials = inq.customer_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <div key={inq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f4f4f5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                backgroundColor: '#f4f4f5',
                                border: '1px solid #e4e4e7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: '#18181b',
                                flexShrink: 0,
                              }}>
                                {initials || 'CU'}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {inq.customer_name}
                                </div>
                                <div style={{ fontSize: '11.5px', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {inq.customer_email || inq.customer_phone} • {inq.created_at ? new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: 800, color: '#09090b' }}>
                                +{formatPrice(inq.quoted_price || inq.painting?.price || 0)}
                              </div>
                              <span style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                backgroundColor: inq.status === 'confirmed' ? '#dcfce7' : inq.status === 'new' ? '#fef3c7' : '#f4f4f5',
                                color: inq.status === 'confirmed' ? '#15803d' : inq.status === 'new' ? '#b45309' : '#52525b',
                              }}>
                                {inq.status || 'NEW'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '30px 10px', textAlign: 'center', color: '#71717a', fontSize: '13px' }}>
                        No inquiries or orders found for the selected date and time range.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PRODUCTS / INVENTORY (Exact Match to Screenshot) */}
          {navSection === 'products' && (
            <div style={{ backgroundColor: '#ffffff' }}>
              {/* Top Header: Title, Subtitle, Search, and + Add Product */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#000000',
                    margin: '0 0 4px 0',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    letterSpacing: '-0.01em',
                  }}>
                    Products Catalog
                  </h1>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: 0,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}>
                    Manage merchandise, pricing, stock levels, and publication status.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Search products input */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search
                      size={13}
                      color="#71717a"
                      style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        padding: '7px 12px 7px 30px',
                        fontSize: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        width: '210px',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  {/* Export Products Catalog (.xlsx) */}
                  <button
                    type="button"
                    onClick={() => exportCurrentSectionReport('products')}
                    title="Export Products Catalog to Excel (.xlsx)"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      color: '#15803d',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dcfce7';
                      e.currentTarget.style.borderColor = '#4ade80';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#86efac';
                    }}
                  >
                    <FileSpreadsheet size={15} color="#16a34a" />
                    <span>Export Catalog (.xlsx)</span>
                  </button>

                  {/* Edit Artwork Detail Tabs & Badges */}
                  <button
                    type="button"
                    onClick={() => setShowArtworkTabsModal(true)}
                    title="Configure Artwork Detail Tabs (Curatorial Note, Provenance & COA, Shipping) and Trust Badges"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.borderColor = '#bfdbfe';
                    }}
                  >
                    <Award size={15} color="#2563eb" />
                    <span>Artwork Tabs & Badges</span>
                  </button>

                  {/* + Add Product Button */}
                  <button
                    type="button"
                    onClick={openAddPaintingModal}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '2px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              </div>

              {/* Sub-bar: PRODUCT LISTING + Item Count Pill + Filters */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderTop: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    color: '#000000',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textTransform: 'uppercase',
                  }}>
                    PRODUCT LISTING
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    padding: '2px 7px',
                    borderRadius: '2px',
                    fontWeight: 500,
                  }}>
                    {filteredPaintings.length} items
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowProductFilter(!showProductFilter)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      color: '#000000',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    <Filter size={12} /> Filters
                  </button>

                  {/* Filter Dropdown */}
                  {showProductFilter && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '4px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      padding: '10px 12px',
                      zIndex: 30,
                      width: '200px',
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Category
                      </div>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => {
                          setProductCategoryFilter(e.target.value);
                          setShowProductFilter(false);
                        }}
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          padding: '6px 8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '2px',
                          backgroundColor: '#ffffff',
                          color: '#000000',
                          outline: 'none',
                        }}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Matching Screenshot */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px', width: '30px' }}>
                        <input type="checkbox" style={{ accentColor: '#000000', cursor: 'pointer' }} />
                      </th>
                      <th style={{ padding: '12px 14px' }}>PRODUCT NAME ∨</th>
                      <th style={{ padding: '12px 14px' }}>CATEGORY ∨</th>
                      <th style={{ padding: '12px 14px' }}>PRICE ∨</th>
                      <th style={{ padding: '12px 14px' }}>STOCK ∨</th>
                      <th style={{ padding: '12px 14px' }}>STATUS ∨</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPaintings.length > 0 ? (
                      filteredPaintings.map((p) => {
                        const categoryObj = categories.find((c) => c.id === p.category_id);
                        const categoryName = categoryObj ? categoryObj.name : (typeof p.category === 'object' && p.category ? p.category.name : (typeof p.category === 'string' ? p.category : 'General'));
                        const skuCode = `SBP-${String(p.id).padStart(4, '0')}`;
                        const stockCount = ((p.id * 7) % 25 + 2);
                        const isInactive = p.status === 'inactive';

                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            {/* Checkbox */}
                            <td style={{ padding: '12px 14px' }}>
                              <input type="checkbox" style={{ accentColor: '#000000', cursor: 'pointer' }} />
                            </td>

                            {/* Product Image & Title */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    objectFit: 'cover',
                                    borderRadius: '2px',
                                    border: '1px solid #e5e7eb',
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <div style={{
                                    fontWeight: 700,
                                    color: '#000000',
                                    fontSize: '13.5px',
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    lineHeight: 1.3,
                                  }}>
                                    {p.title}
                                  </div>
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#71717a',
                                    fontFamily: 'monospace, sans-serif',
                                    marginTop: '2px',
                                  }}>
                                    {skuCode}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td style={{
                              padding: '12px 14px',
                              fontSize: '12.5px',
                              color: '#111111',
                              fontFamily: "'Playfair Display', Georgia, serif",
                            }}>
                              {categoryName}
                            </td>

                            {/* Price */}
                            <td style={{
                              padding: '12px 14px',
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#000000',
                            }}>
                              {formatPrice(p.price)}
                            </td>

                            {/* Stock */}
                            <td style={{
                              padding: '12px 14px',
                              fontSize: '12.5px',
                              color: '#111111',
                            }}>
                              {stockCount}
                            </td>

                            {/* Status: ACTIVE (solid black) or INACTIVE (white with black border) */}
                            <td style={{ padding: '12px 14px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleProductStatus(p)}
                                title="Click to toggle status between ACTIVE and INACTIVE"
                                style={{
                                  backgroundColor: isInactive ? '#ffffff' : '#000000',
                                  color: isInactive ? '#000000' : '#ffffff',
                                  border: isInactive ? '1px solid #000000' : 'none',
                                  padding: '3px 8px',
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                  display: 'inline-block',
                                }}
                              >
                                {isInactive ? 'INACTIVE' : 'ACTIVE'}
                              </button>
                            </td>

                            {/* Actions: Edit & Delete text links */}
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => openEditPaintingModal(p)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#000000',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePainting(p.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#71717a',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginLeft: '12px',
                                  padding: 0,
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#71717a', fontSize: '13px' }}>
                          No products found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: INQUIRIES & CRM */}
          {navSection === 'inquiries' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
                    Customer Inquiries & Cart Requests
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Direct CRM inquiries with 1-click WhatsApp messaging and status updates.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* WhatsApp Direct Inquiry Number Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setTempWhatsappNumber(footerConfig.social_links?.whatsapp || footerConfig.contact_phone || '');
                      setShowWhatsappModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#15803d',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    title="Configure WhatsApp Concierge Number for customer direct inquiries"
                  >
                    <MessageCircle size={15} style={{ color: '#16a34a' }} />
                    <span>WhatsApp Number: <strong style={{ color: '#14532d' }}>{footerConfig.social_links?.whatsapp || footerConfig.contact_phone || 'Not set'}</strong></span>
                    <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', padding: '2px 7px', borderRadius: '3px', border: '1px solid #bbf7d0', marginLeft: '4px', color: '#166534' }}>
                      Change Number
                    </span>
                  </button>

                  <select
                    value={inquiryStatusFilter}
                    onChange={(e) => setInquiryStatusFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      outline: 'none',
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">Under Review (New)</option>
                    <option value="contacted">Curator Contacted</option>
                    <option value="confirmed">Confirmed / Paid</option>
                    <option value="completed">Completed Delivery</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Inquiries Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px' }}>CODE</th>
                      <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
                      <th style={{ padding: '12px 14px' }}>ARTWORK</th>
                      <th style={{ padding: '12px 14px' }}>QUOTE</th>
                      <th style={{ padding: '12px 14px' }}>STATUS</th>
                      <th style={{ padding: '12px 14px' }}>CONTACT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.length > 0 ? (
                      filteredInquiries.map((inq) => {
                        const cleanPhone = inq.customer_phone.replace(/[^0-9]/g, '');
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(inq.customer_name)},%20thank%20you%20for%20your%20inquiry%20(${inq.inquiry_code})%20at%20ArtGallery!`;

                        return (
                          <tr key={inq.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, color: '#000000', fontSize: '13px', fontFamily: 'monospace' }}>
                                {inq.inquiry_code}
                              </div>
                              <div style={{
                                fontSize: '11px',
                                color: '#71717a',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <Calendar size={11} color="#71717a" />
                                {new Date(inq.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div style={{
                                fontSize: '10.5px',
                                color: '#a1a1aa',
                                marginTop: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}>
                                <Clock size={10} color="#a1a1aa" />
                                {new Date(inq.created_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, color: '#000000', fontSize: '13.5px', fontFamily: "'Playfair Display', Georgia, serif" }}>{inq.customer_name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#000000', fontWeight: 600, marginTop: '2px' }}>
                                <Phone size={12} color="#000000" />
                                <a href={`tel:${inq.customer_phone}`} style={{ color: '#000000', textDecoration: 'none' }}>
                                  {inq.customer_phone}
                                </a>
                              </div>
                              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '1px' }}>{inq.customer_email}</div>
                              <div style={{ fontSize: '12px', color: '#71717a' }}>{inq.shipping_address}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {inq.painting?.title || 'Original Art'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#71717a', fontFamily: 'monospace' }}>
                                ID: #{inq.painting_id}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#000000' }}>
                              {formatPrice(inq.quoted_price)}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <select
                                value={inq.status}
                                onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  borderRadius: '2px',
                                  border: '1px solid #e5e7eb',
                                  backgroundColor: '#ffffff',
                                  color: '#000000',
                                  fontWeight: 600,
                                  outline: 'none',
                                }}
                              >
                                <option value="new">New / Under Review</option>
                                <option value="contacted">Contacted</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '5px 10px',
                                    borderRadius: '2px',
                                    backgroundColor: '#000000',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    letterSpacing: '0.04em',
                                  }}
                                >
                                  <MessageCircle size={13} /> WhatsApp
                                </a>
                                <a
                                  href={`tel:${inq.customer_phone}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '2px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    color: '#000000',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                  }}
                                >
                                  <Phone size={11} /> Call Now
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No inquiries found. Customer cart orders will appear here in real time.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: USERS MANAGEMENT */}
          {navSection === 'users' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Users & Collector Accounts
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    View all registered customers, collectors, and admins stored in PostgreSQL.
                  </p>
                </div>

                {/* Search & Role Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    border: '1px solid #e5e7eb',
                    width: '210px',
                  }}>
                    <Search size={13} color="#71717a" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        fontSize: '12px',
                        color: '#000000',
                        width: '100%',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      outline: 'none',
                    }}
                  >
                    <option value="">All Roles ({users.length})</option>
                    <option value="customer">Customers ({users.filter(u => u.role === 'customer').length})</option>
                    <option value="admin">Administrators ({users.filter(u => u.role === 'admin').length})</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px' }}>USER</th>
                      <th style={{ padding: '12px 14px' }}>CONTACT & LOCATION</th>
                      <th style={{ padding: '12px 14px' }}>ROLE</th>
                      <th style={{ padding: '12px 14px' }}>STATUS</th>
                      <th style={{ padding: '12px 14px' }}>REGISTERED DATE</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                        const initials = u.full_name
                          ? u.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                          : 'U';
                        const cleanPhone = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
                        const whatsappUrl = cleanPhone
                          ? `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(u.full_name)},%20greetings%20from%20ArtGallery!`
                          : null;

                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            {/* User Avatar, Name & Email */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '2px',
                                  backgroundColor: u.role === 'admin' ? '#000000' : '#f4f4f5',
                                  color: u.role === 'admin' ? '#ffffff' : '#000000',
                                  border: '1px solid #e5e7eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '11px',
                                  flexShrink: 0,
                                }}>
                                  {initials}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#000000', fontSize: '13.5px', fontFamily: "'Playfair Display', Georgia, serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {u.full_name}
                                    {u.role === 'admin' && (
                                      <span title="Administrator" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <ShieldCheck size={13} color="#000000" />
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#71717a' }}>{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Contact & Location */}
                            <td style={{ padding: '12px 14px' }}>
                              {u.phone ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#000000', fontSize: '12px' }}>
                                  <Phone size={11} color="#000000" />
                                  <a href={`tel:${u.phone}`} style={{ color: '#000000', textDecoration: 'none' }}>
                                    {u.phone}
                                  </a>
                                </div>
                              ) : (
                                <span style={{ color: '#a1a1aa', fontSize: '12px' }}>No phone listed</span>
                              )}
                              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={11} color="#a1a1aa" />
                                {u.address ? `${u.address}${u.city ? `, ${u.city}` : ''}` : u.city || 'Location not specified'}
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '2px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                backgroundColor: u.role === 'admin' ? '#000000' : '#ffffff',
                                color: u.role === 'admin' ? '#ffffff' : '#000000',
                                border: u.role === 'admin' ? 'none' : '1px solid #000000',
                              }}>
                                {u.role}
                              </span>
                            </td>

                            {/* Status Active / Inactive Button */}
                            <td style={{ padding: '12px 14px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleUserActive(u)}
                                title="Click to toggle active status"
                                style={{
                                  backgroundColor: u.is_active ? '#000000' : '#ffffff',
                                  color: u.is_active ? '#ffffff' : '#000000',
                                  border: u.is_active ? 'none' : '1px solid #000000',
                                  padding: '3px 8px',
                                  borderRadius: '2px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                  cursor: 'pointer',
                                }}
                              >
                                {u.is_active ? 'ACTIVE' : 'DISABLED'}
                              </button>
                            </td>

                            {/* Registered Date */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: '12px', color: '#000000', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar size={11} color="#71717a" />
                                {new Date(u.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {whatsappUrl && (
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '4px 8px',
                                      borderRadius: '2px',
                                      backgroundColor: '#000000',
                                      color: '#ffffff',
                                      textDecoration: 'none',
                                      fontWeight: 600,
                                      fontSize: '11px',
                                    }}
                                    title="WhatsApp user"
                                  >
                                    <MessageCircle size={11} /> WhatsApp
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#71717a',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                  title="Delete user account"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No users found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 4: HERO BANNERS */}
          {navSection === 'banners' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Bar */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#000000',
                    margin: 0,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}>
                    Homepage Hero Banners
                  </h2>
                  <p style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    margin: '4px 0 0 0',
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}>
                    Edit the promotional banners, headlines, description text, artist names, prices, and artwork images shown on the store hero slider.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={loadAllAdminData}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>

                  <button
                    onClick={openAddBannerModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '2px',
                      border: 'none',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add Hero Banner
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              {banners.filter(b => b.is_active).length > 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Sun size={14} color="#000000" /> Live Homepage Hero Preview &mdash;
                      <span style={{ color: '#000000', fontWeight: 700, textTransform: 'none', fontSize: '13px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {(selectedPreviewBannerId ? banners.find(b => b.id === selectedPreviewBannerId) : null)?.title || (banners.find(b => b.is_active) || banners[0])?.title}
                      </span>
                    </div>

                    {banners.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600 }}>
                          {(banners.findIndex((b) => b.id === ((selectedPreviewBannerId ? banners.find(item => item.id === selectedPreviewBannerId) : null) || banners.find(item => item.is_active) || banners[0])?.id) + 1)} of {banners.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = (selectedPreviewBannerId ? banners.find(item => item.id === selectedPreviewBannerId) : null) || banners.find(item => item.is_active) || banners[0];
                            const idx = banners.findIndex((b) => b.id === cur?.id);
                            const prevIdx = idx <= 0 ? banners.length - 1 : idx - 1;
                            setSelectedPreviewBannerId(banners[prevIdx].id);
                          }}
                          title="Previous banner preview"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e4e4e7',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowLeft size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = (selectedPreviewBannerId ? banners.find(item => item.id === selectedPreviewBannerId) : null) || banners.find(item => item.is_active) || banners[0];
                            const idx = banners.findIndex((b) => b.id === cur?.id);
                            const nextIdx = idx >= banners.length - 1 ? 0 : idx + 1;
                            setSelectedPreviewBannerId(banners[nextIdx].id);
                          }}
                          title="Next banner preview"
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e4e4e7',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const previewBanner = (selectedPreviewBannerId ? banners.find(b => b.id === selectedPreviewBannerId) : null) || banners.find(b => b.is_active) || banners[0];
                    if (!previewBanner) return null;
                    const previewTextColor = previewBanner.text_color || '#ffffff';
                    const previewBgColor = previewBanner.bg_color || '#0062d2';
                    const isDarkText = ['#111111', '#09090b', '#000000', '#1c1917', '#27272a', '#1e293b', '#334155'].includes(previewTextColor.toLowerCase());
                    return (
                      <div style={{
                        backgroundColor: previewBgColor,
                        background: `radial-gradient(circle at 75% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%), linear-gradient(135deg, ${previewBgColor} 0%, ${previewBgColor} 100%)`,
                        borderRadius: '8px',
                        padding: '36px 32px',
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 1fr',
                        alignItems: 'center',
                        gap: '30px',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid #e5e5e5',
                        transition: 'all 0.3s ease',
                      }}>
                        {/* Left Typography */}
                        <div>
                          <div style={{
                            color: previewTextColor,
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            marginBottom: '10px',
                            opacity: 0.9,
                          }}>
                            {previewBanner.tag}
                          </div>
                          <h3 style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            color: previewTextColor,
                            margin: '0 0 12px 0',
                            lineHeight: 1.2,
                            fontFamily: "'Playfair Display', Georgia, serif",
                          }}>
                            {previewBanner.title}
                          </h3>
                          <p style={{
                            fontSize: '13px',
                            color: previewTextColor,
                            opacity: 0.85,
                            lineHeight: 1.6,
                            margin: '0 0 20px 0',
                            maxWidth: '420px',
                          }}>
                            {previewBanner.description}
                          </p>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: isDarkText ? '#09090b' : '#ffffff',
                            color: isDarkText ? '#ffffff' : (previewBgColor.toLowerCase() === '#ffffff' ? '#09090b' : previewBgColor),
                            padding: '10px 22px',
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            borderRadius: '4px',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                          }}>
                            {previewBanner.button_text || 'SHOP NOW'} →
                          </div>
                        </div>

                        {/* Right Artwork Frame */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                        }}>
                          {/* Pastel Backdrop */}
                          <div style={{
                            position: 'absolute',
                            width: '240px',
                            height: '240px',
                            borderRadius: '50%',
                            backgroundColor: previewBanner.circle_color || '#eedcd5',
                          }} />

                          {/* Artwork Card */}
                          <div style={{
                            position: 'relative',
                            zIndex: 2,
                            width: '190px',
                            height: '240px',
                            backgroundColor: '#ffffff',
                            border: '4px solid #ffffff',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}>
                            <img
                              src={previewBanner.image_url}
                              alt={previewBanner.title}
                              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                            />
                            <div style={{
                              padding: '8px 10px',
                              backgroundColor: '#ffffff',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}>
                              <div>
                                <div style={{ fontSize: '9px', color: '#888888', textTransform: 'uppercase', fontWeight: 700 }}>
                                  {previewBanner.artist_name}
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#111111', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {previewBanner.title}
                                </div>
                              </div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#000000' }}>
                                {formatPrice(previewBanner.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Banners Table */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      All Configured Hero Banners ({banners.length})
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    Active banners will rotate in the homepage hero slider
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 14px' }}>COLORS & ARTWORK</th>
                        <th style={{ padding: '12px 14px' }}>PROMO TAG & HEADLINE</th>
                        <th style={{ padding: '12px 14px' }}>ARTIST & DISPLAY PRICE</th>
                        <th style={{ padding: '12px 14px' }}>BUTTON TEXT</th>
                        <th style={{ padding: '12px 14px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banners.length > 0 ? (
                        banners.map((b) => {
                          const currentPreviewId = (selectedPreviewBannerId ? banners.find(item => item.id === selectedPreviewBannerId) : null)?.id || (banners.find(item => item.is_active) || banners[0])?.id;
                          const isCurrentlyPreviewed = currentPreviewId === b.id;

                          return (
                            <tr
                              key={b.id}
                              onClick={() => setSelectedPreviewBannerId(b.id)}
                              style={{
                                borderBottom: '1px solid #f4f4f5',
                                cursor: 'pointer',
                                backgroundColor: isCurrentlyPreviewed ? '#f4f4f5' : 'transparent',
                                transition: 'background-color 0.15s ease',
                              }}
                              title="Click to view this banner in the top preview"
                            >
                              {/* Artwork Image, Circle Swatch & BG Swatch */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    position: 'relative',
                                    width: '54px',
                                    height: '54px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: b.bg_color || '#f3f2ee',
                                    borderRadius: '2px',
                                    border: isCurrentlyPreviewed ? '2px solid #000000' : '1px solid #e5e7eb',
                                  }}>
                                    <div style={{
                                      position: 'absolute',
                                      width: '42px',
                                      height: '42px',
                                      borderRadius: '50%',
                                      backgroundColor: b.circle_color || '#eedcd5',
                                    }} />
                                    <img
                                      src={b.image_url}
                                      alt={b.title}
                                      style={{
                                        position: 'relative',
                                        zIndex: 1,
                                        width: '32px',
                                        height: '40px',
                                        objectFit: 'cover',
                                        borderRadius: '2px',
                                        border: '1px solid #ffffff',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                      }}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a' }}>
                                      <span style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: b.bg_color || '#f3f2ee', border: '1px solid #d4d4d8', display: 'inline-block' }} />
                                      BG: <code style={{ fontSize: '10px' }}>{b.bg_color || '#f3f2ee'}</code>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a' }}>
                                      <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: b.circle_color || '#eedcd5', border: '1px solid #d4d4d8', display: 'inline-block' }} />
                                      Circle: <code style={{ fontSize: '10px' }}>{b.circle_color || '#eedcd5'}</code>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#71717a' }}>
                                      <span style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: b.text_color || '#ffffff', border: '1px solid #d4d4d8', display: 'inline-block' }} />
                                      Text: <code style={{ fontSize: '10px' }}>{b.text_color || '#ffffff'}</code>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Tag & Headline */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{
                                  color: '#000000',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  marginBottom: '2px',
                                }}>
                                  {b.tag}
                                </div>
                                <div style={{ fontSize: '12px', color: '#71717a', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {b.description}
                                </div>
                              </td>

                              {/* Artist & Price */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 700, color: '#000000', fontSize: '13px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                  {b.artist_name}
                                </div>
                                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#000000', marginTop: '2px' }}>
                                  {formatPrice(b.price)}
                                </div>
                              </td>

                              {/* Button Text */}
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#ffffff',
                                  borderRadius: '2px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  color: '#000000',
                                  border: '1px solid #e5e7eb',
                                }}>
                                  {b.button_text}
                                </span>
                              </td>

                              {/* Active Switch */}
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleBannerActive(b.id);
                                    }}
                                    title={b.is_active ? 'Click to disable banner' : 'Click to enable banner'}
                                    style={{
                                      width: '36px',
                                      height: '20px',
                                      borderRadius: '999px',
                                      backgroundColor: b.is_active ? '#000000' : '#e5e7eb',
                                      border: 'none',
                                      position: 'relative',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      transition: 'background-color 0.2s ease',
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                        transition: 'transform 0.2s ease',
                                        transform: b.is_active ? 'translateX(16px)' : 'translateX(1px)',
                                      }}
                                    />
                                  </button>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    color: b.is_active ? '#000000' : '#71717a',
                                  }}>
                                    {b.is_active ? 'Active' : 'Hidden'}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditBannerModal(b);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#000000',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteBanner(b.id);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#71717a',
                                    fontWeight: 500,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    marginLeft: '12px',
                                    padding: 0,
                                  }}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                            No hero banners found. Click &quot;Add Hero Banner&quot; above to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SHOWCASE MARQUEE MANAGEMENT */}
          {navSection === 'showcase' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Card */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#000000" /> Showcase Marquee Images
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Upload and manage promotional photos displayed in the continuous moving marquee (next to the &quot;Spring Sale&quot; countdown).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddShowcaseModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add Showcase Image
                </button>
              </div>

              {/* Live Preview Strip */}
              {showcases.filter((s) => s.is_active).length > 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '20px 24px',
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Live Preview Strip ({showcases.filter((s) => s.is_active).length} Active Photos)
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '14px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                  }}>
                    {showcases.filter((s) => s.is_active).map((item) => (
                      <div
                        key={`preview-sc-${item.id}`}
                        style={{
                          width: '180px',
                          height: '140px',
                          flexShrink: 0,
                          position: 'relative',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#1f2937',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.title || 'Showcase'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {item.tag && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            backgroundColor: 'rgba(27, 59, 43, 0.9)',
                            color: '#ffffff',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '3px',
                          }}>
                            {item.tag}
                          </div>
                        )}
                        {item.title && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '10px 8px 6px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Showcase Items Table */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    All Showcase Photos ({showcases.length})
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    Active photos appear in the scrolling marquee with smooth infinite loop
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 14px', width: '100px' }}>PREVIEW</th>
                        <th style={{ padding: '12px 14px' }}>BADGE / TAG</th>
                        <th style={{ padding: '12px 14px' }}>TITLE & CAPTION</th>
                        <th style={{ padding: '12px 14px', width: '90px' }}>ORDER</th>
                        <th style={{ padding: '12px 14px', width: '120px' }}>STATUS</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right', width: '130px' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {showcases.length > 0 ? (
                        showcases.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{
                                width: '90px',
                                height: '65px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb',
                                backgroundColor: '#18181b',
                              }}>
                                <img
                                  src={getImageUrl(item.image_url)}
                                  alt={item.title || 'Showcase'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {item.tag ? (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '3px 8px',
                                  borderRadius: '3px',
                                  backgroundColor: '#1b3b2b',
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                }}>
                                  {item.tag}
                                </span>
                              ) : (
                                <span style={{ color: '#9ca3af', fontSize: '12px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#000000' }}>
                                {item.title || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Untitled</span>}
                              </div>
                              {item.description && (
                                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px', maxWidth: '340px' }}>
                                  {item.description}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '13px', color: '#374151' }}>
                              #{item.display_order}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleShowcaseActive(item.id)}
                                  style={{
                                    width: '36px',
                                    height: '20px',
                                    borderRadius: '999px',
                                    backgroundColor: item.is_active ? '#000000' : '#e5e7eb',
                                    border: 'none',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s ease',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#ffffff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                      transition: 'transform 0.2s ease',
                                      transform: item.is_active ? 'translateX(16px)' : 'translateX(1px)',
                                    }}
                                  />
                                </button>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  color: item.is_active ? '#000000' : '#71717a',
                                }}>
                                  {item.is_active ? 'Active' : 'Hidden'}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => openEditShowcaseModal(item)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#000000',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteShowcase(item.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#71717a',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginLeft: '12px',
                                  padding: 0,
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                            No showcase photos uploaded yet. Click &quot;Add Showcase Image&quot; to upload your first photo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: STORE PRODUCT SECTIONS */}
          {navSection === 'sections' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
                    Store Product Sections
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Manage sections (e.g. Best Sellers, New Arrivals, Hot Sales). Each section is displayed one by one on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddSectionModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add New Section
                </button>
              </div>

              {/* Sections Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px', width: '60px' }}>ORDER</th>
                      <th style={{ padding: '12px 14px', width: '70px' }}>IMAGE</th>
                      <th style={{ padding: '12px 14px' }}>SECTION NAME</th>
                      <th style={{ padding: '12px 14px' }}>SLUG</th>
                      <th style={{ padding: '12px 14px' }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 14px' }}>ASSIGNED ARTWORKS</th>
                      <th style={{ padding: '12px 14px' }}>STATUS</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.length > 0 ? (
                      sections.map((sec) => {
                        const count = paintings.filter((p) => p.section_id === sec.id).length;
                        return (
                          <tr key={sec.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#71717a' }}>
                              #{sec.display_order}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{
                                width: '48px',
                                height: '36px',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                backgroundColor: '#f4f4f5',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                {sec.image_url ? (
                                  <img
                                    src={sec.image_url}
                                    alt={sec.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <Layers size={16} color="#71717a" />
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {sec.name}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#71717a' }}>
                              /{sec.slug}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#52525b', fontSize: '12.5px', maxWidth: '300px' }}>
                              {sec.description || '—'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 8px',
                                borderRadius: '2px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#000000',
                                fontWeight: 600,
                                fontSize: '11px',
                              }}>
                                <ShoppingBag size={11} color="#000000" />
                                {count} {count === 1 ? 'artwork' : 'artworks'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '2px',
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                backgroundColor: sec.is_active ? '#000000' : '#ffffff',
                                color: sec.is_active ? '#ffffff' : '#000000',
                                border: sec.is_active ? 'none' : '1px solid #000000',
                              }}>
                                {sec.is_active ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => openEditSectionModal(sec)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#000000',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(sec.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#71717a',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginLeft: '12px',
                                  padding: 0,
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No product sections found. Click &quot;Add New Section&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: CATEGORIES MANAGEMENT */}
          {navSection === 'categories' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
                    Product Collections
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Manage art collections and upload cover images for the circular storefront collection pills and filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddCategoryModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add New Collection
                </button>
              </div>

              {/* Categories Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px', width: '70px' }}>IMAGE</th>
                      <th style={{ padding: '12px 14px' }}>COLLECTION NAME</th>
                      <th style={{ padding: '12px 14px' }}>SLUG</th>
                      <th style={{ padding: '12px 14px' }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 14px' }}>ASSIGNED ARTWORKS</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map((cat) => {
                        const count = cat.paintings_count !== undefined
                          ? cat.paintings_count
                          : paintings.filter((p) => p.category_id === cat.id).length;
                        const samplePainting = paintings.find((p) => p.category_id === cat.id);
                        const displayImg = cat.image_url || samplePainting?.image_url;

                        return (
                          <tr key={cat.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: '#f4f4f5',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                {displayImg ? (
                                  <img
                                    src={displayImg}
                                    alt={cat.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 700, color: '#71717a', fontSize: '14px' }}>
                                    {cat.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {cat.name}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#71717a' }}>
                              /{cat.slug}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#52525b', fontSize: '12.5px', maxWidth: '300px' }}>
                              {cat.description || '—'}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 8px',
                                borderRadius: '2px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                color: '#000000',
                                fontWeight: 600,
                                fontSize: '11px',
                              }}>
                                <ShoppingBag size={11} color="#000000" />
                                {count} {count === 1 ? 'artwork' : 'artworks'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => openEditCategoryModal(cat)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#000000',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  padding: 0,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#71717a',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginLeft: '12px',
                                  padding: 0,
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No collections found. Click &quot;Add New Collection&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: TESTIMONIALS MANAGEMENT */}
          {navSection === 'testimonials' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif", margin: 0 }}>
                    Patron Testimonials & Reviews
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Manage collector testimonials displayed in &quot;What Our Patrons Say&quot; on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddTestimonialModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '2px',
                    border: 'none',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add New Testimonial
                </button>
              </div>

              {/* Testimonials Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{
                      borderTop: '1px solid #e5e7eb',
                      borderBottom: '1px solid #e5e7eb',
                      color: '#6b7280',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      <th style={{ padding: '12px 14px', width: '60px' }}>ORDER</th>
                      <th style={{ padding: '12px 14px' }}>PATRON</th>
                      <th style={{ padding: '12px 14px' }}>RATING</th>
                      <th style={{ padding: '12px 14px' }}>TESTIMONIAL QUOTE</th>
                      <th style={{ padding: '12px 14px' }}>STATUS</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.length > 0 ? (
                      testimonials.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#71717a' }}>
                            #{t.display_order}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                              {t.name}
                            </div>
                            {t.location && (
                              <div style={{ fontSize: '11.5px', color: '#71717a', marginTop: '2px' }}>
                                {t.location}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '2px', color: '#000000' }}>
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <span key={i} style={{ fontSize: '13px' }}>★</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#52525b', fontSize: '12.5px', maxWidth: '380px', fontStyle: 'italic' }}>
                            &ldquo;{t.quote}&rdquo;
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleTestimonialActive(t.id)}
                                title={t.is_active ? 'Click to hide' : 'Click to show'}
                                style={{
                                  width: '36px',
                                  height: '20px',
                                  borderRadius: '999px',
                                  backgroundColor: t.is_active ? '#000000' : '#e5e7eb',
                                  border: 'none',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  transition: 'background-color 0.2s ease',
                                }}
                              >
                                <span
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                    transition: 'transform 0.2s ease',
                                    transform: t.is_active ? 'translateX(16px)' : 'translateX(1px)',
                                  }}
                                />
                              </button>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                color: t.is_active ? '#000000' : '#71717a',
                              }}>
                                {t.is_active ? 'Active' : 'Hidden'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => openEditTestimonialModal(t)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#000000',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTestimonial(t.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#71717a',
                                fontWeight: 500,
                                fontSize: '12px',
                                cursor: 'pointer',
                                marginLeft: '12px',
                                padding: 0,
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No patron testimonials found. Click &quot;Add New Testimonial&quot; to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: FOOTER MANAGEMENT */}
          {navSection === 'footer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header with Save Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '20px 24px',
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    <PanelBottom size={18} color="#000000" /> Global Storefront Footer Settings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Customize every section of the storefront footer: brand identity, studio contact, curated categories, custom links, social media links, newsletter, and copyright.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {footerSaveSuccess && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#000000',
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #e5e7eb',
                      padding: '7px 12px',
                      borderRadius: '2px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      <CheckCircle2 size={14} color="#000000" /> Saved Successfully!
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveFooterConfig}
                    disabled={isSavingFooter}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 18px',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '2px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: isSavingFooter ? 'not-allowed' : 'pointer',
                      opacity: isSavingFooter ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSavingFooter ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>Save Footer Settings</>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 1: Brand Information & Contact */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
              }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  1. Brand Identity &amp; Studio Contact
                </h4>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  First column content in the footer: brand title, mission tagline, and studio contact info.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      Brand Title (Logo Text)
                    </label>
                    <input
                      type="text"
                      value={footerConfig.brand_name}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_name: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        marginBottom: '14px',
                        color: '#000000',
                      }}
                    />

                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={footerConfig.brand_subtitle || ''}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_subtitle: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000000',
                        boxSizing: 'border-box',
                        marginBottom: '14px',
                      }}
                    />

                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      Brand Description
                    </label>
                    <textarea
                      rows={3}
                      value={footerConfig.brand_description}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_description: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '4px' }}>
                        📍 Studio Location
                      </label>
                      <input
                        type="text"
                        value={footerConfig.studio_location || ''}
                        onChange={(e) => setFooterConfig({ ...footerConfig, studio_location: e.target.value })}
                        placeholder=""
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '2px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12.5px',
                          boxSizing: 'border-box',
                          color: '#000000',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '4px' }}>
                        📞 Concierge Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={footerConfig.contact_phone || ''}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contact_phone: e.target.value })}
                        placeholder=""
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '2px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12.5px',
                          boxSizing: 'border-box',
                          color: '#000000',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '4px' }}>
                        ✉️ Concierge Email
                      </label>
                      <input
                        type="email"
                        value={footerConfig.contact_email || ''}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contact_email: e.target.value })}
                        placeholder=""
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '2px',
                          border: '1px solid #e5e7eb',
                          fontSize: '12.5px',
                          boxSizing: 'border-box',
                          color: '#000000',
                        }}
                      />
                    </div>

                    <div style={{ paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={footerConfig.show_payment_methods}
                          onChange={(e) => setFooterConfig({ ...footerConfig, show_payment_methods: e.target.checked })}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                          Display Payment Logos Badge
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2 & 3: Categories & Custom Links Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Categories Column Config */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    2. Curated Categories Column
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Second column header and limits for categories loaded from database.
                  </p>

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.categories_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, categories_title: e.target.value })}
                    placeholder="CURATED CATEGORIES"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                      color: '#000000',
                    }}
                  />

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Max Categories to Show
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={footerConfig.max_categories_to_show}
                    onChange={(e) => setFooterConfig({ ...footerConfig, max_categories_to_show: parseInt(e.target.value) || 7 })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '12px',
                      color: '#000000',
                    }}
                  />

                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#f4f4f5',
                    borderRadius: '2px',
                    fontSize: '12px',
                    color: '#71717a',
                  }}>
                    💡 Current active categories in your store: <strong>{categories.length}</strong>. The footer will dynamically show up to the top {footerConfig.max_categories_to_show} categories.
                  </div>
                </div>

                {/* Custom Column (Curation Desk) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      3. Custom Column (Curation Desk)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddCustomLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#000000',
                      }}
                    >
                      <Plus size={13} /> Add Link
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Third column custom advisory &amp; service links.
                  </p>

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.custom_column_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, custom_column_title: e.target.value })}
                    placeholder="CURATION DESK"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                      color: '#000000',
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                    {(footerConfig.custom_links || []).map((link, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateCustomLink(idx, 'title', e.target.value)}
                          placeholder="Link text"
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '2px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            color: '#000000',
                          }}
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateCustomLink(idx, 'url', e.target.value)}
                          placeholder="URL / #"
                          style={{
                            width: '110px',
                            padding: '6px 10px',
                            borderRadius: '2px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            color: '#000000',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomLink(idx)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#71717a',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Remove link"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 4: Social Media & Community Links */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
              }}>
                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  4. Social Media &amp; Community Links (Connect With Us)
                </h4>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Configure your official social media URLs displayed prominently with branded logos in the storefront footer.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      Section Header Title
                    </label>
                    <input
                      type="text"
                      value={footerConfig.social_links?.section_title || ''}
                      onChange={(e) => handleUpdateSocialLink('section_title', e.target.value)}
                      placeholder="Connect With Us"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      📸 Instagram Profile URL
                    </label>
                    <input
                      type="url"
                      value={footerConfig.social_links?.instagram || ''}
                      onChange={(e) => handleUpdateSocialLink('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourbrand"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      👥 Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={footerConfig.social_links?.facebook || ''}
                      onChange={(e) => handleUpdateSocialLink('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      💬 WhatsApp Number or Chat URL
                    </label>
                    <input
                      type="text"
                      value={footerConfig.social_links?.whatsapp || ''}
                      onChange={(e) => handleUpdateSocialLink('whatsapp', e.target.value)}
                      placeholder="+91 98765 43210 or https://wa.me/..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      🐦 Twitter / X Profile URL
                    </label>
                    <input
                      type="url"
                      value={footerConfig.social_links?.twitter || ''}
                      onChange={(e) => handleUpdateSocialLink('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                      ▶️ YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      value={footerConfig.social_links?.youtube || ''}
                      onChange={(e) => handleUpdateSocialLink('youtube', e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        color: '#000000',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 5 & 6: Newsletter & Copyright */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Newsletter Column Config */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    5. Newsletter Subscription Column
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Newsletter pitch and input placeholder.
                  </p>

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.newsletter_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_title: e.target.value })}
                    placeholder="Subscribe for 10% Off"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                      color: '#000000',
                    }}
                  />

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Newsletter Pitch / Description
                  </label>
                  <textarea
                    rows={3}
                    value={footerConfig.newsletter_description}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_description: e.target.value })}
                    placeholder="Subscribe for special artwork previews..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      marginBottom: '14px',
                      color: '#000000',
                    }}
                  />

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Email Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={footerConfig.newsletter_placeholder}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_placeholder: e.target.value })}
                    placeholder="Enter your email"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                      color: '#000000',
                    }}
                  />
                </div>

                {/* Copyright & Direct Contact Info */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    6. Copyright &amp; Advisory Contact
                  </h4>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Bottom bar copyright notice and contact advisory info.
                  </p>

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Copyright Bar Text
                  </label>
                  <input
                    type="text"
                    value={footerConfig.copyright_text}
                    onChange={(e) => setFooterConfig({ ...footerConfig, copyright_text: e.target.value })}
                    placeholder="Copyright © 2026 All rights reserved"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                      color: '#000000',
                    }}
                  />

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Direct WhatsApp / Phone Contact
                  </label>
                  <input
                    type="text"
                    value={footerConfig.contact_phone || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                      color: '#000000',
                    }}
                  />

                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#000000', display: 'block', marginBottom: '6px' }}>
                    Advisory Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={footerConfig.contact_email || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, contact_email: e.target.value })}
                    placeholder="hello@gmail.com"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '2px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                      color: '#000000',
                    }}
                  />
                </div>

                {/* CARD 7: Artwork Product Page: Tabs & Trust Badges */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                  gridColumn: '1 / -1',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                        7. Artwork Product Page: Information Tabs &amp; Trust Badges
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Customize headings, certificate &amp; provenance text, shipping statements, and the 3 trust badges displayed on all artwork product pages.
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  {(() => {
                    const current = getArtworkTabs();
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                        {/* Tab 1: Description */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={15} color="#2563eb" /> Information Tab 1: Overview &amp; Curatorial Note
                          </div>
                          <div>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                              Tab 1 Title / Heading
                            </label>
                            <input
                              type="text"
                              value={current.tab1_title || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab1_title', e.target.value)}
                              placeholder="Curatorial Note"
                              style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                            />
                            <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px', display: 'block' }}>
                              Note: This tab automatically presents the individual artwork's medium, dimensions, category, and curator description.
                            </span>
                          </div>
                        </div>

                        {/* Tab 2: Provenance & COA */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={15} color="#16a34a" /> Information Tab 2: Provenance &amp; Authenticity (COA)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                                Tab 2 Title / Heading
                              </label>
                              <input
                                type="text"
                                value={current.tab2_title || ''}
                                onChange={(e) => handleUpdateArtworkTab('tab2_title', e.target.value)}
                                placeholder="Provenance & COA"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                                Statement / Introduction Text (Use <code>{'{artist}'}</code> to automatically insert the artwork's artist name)
                              </label>
                              <textarea
                                rows={2}
                                value={current.tab2_intro || ''}
                                onChange={(e) => handleUpdateArtworkTab('tab2_intro', e.target.value)}
                                placeholder="Every acquisition from our gallery includes a registered, tamper-evident Certificate of Authenticity (COA) signed directly by {artist} and counter-stamped by our Chief Curator."
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 1
                                </label>
                                <input
                                  type="text"
                                  value={current.tab2_point1 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab2_point1', e.target.value)}
                                  placeholder="Official gallery archive serial registration number"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 2
                                </label>
                                <input
                                  type="text"
                                  value={current.tab2_point2 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab2_point2', e.target.value)}
                                  placeholder="Archival acid-free cotton certificate backing"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 3
                                </label>
                                <input
                                  type="text"
                                  value={current.tab2_point3 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab2_point3', e.target.value)}
                                  placeholder="Guaranteed museum provenance with transfer of ownership"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tab 3: Shipping */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={15} color="#0284c7" /> Information Tab 3: White-Glove Shipping
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                                Tab 3 Title / Heading
                              </label>
                              <input
                                type="text"
                                value={current.tab3_title || ''}
                                onChange={(e) => handleUpdateArtworkTab('tab3_title', e.target.value)}
                                placeholder="White-Glove Shipping"
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                                Statement / Introduction Text
                              </label>
                              <textarea
                                rows={2}
                                value={current.tab3_intro || ''}
                                onChange={(e) => handleUpdateArtworkTab('tab3_intro', e.target.value)}
                                placeholder="We ensure museum-grade protective packaging using shock-absorbing archival foam and custom wood casing."
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                              />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 1
                                </label>
                                <input
                                  type="text"
                                  value={current.tab3_point1 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab3_point1', e.target.value)}
                                  placeholder="Complimentary insured door-to-door courier across India"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 2
                                </label>
                                <input
                                  type="text"
                                  value={current.tab3_point2 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab3_point2', e.target.value)}
                                  placeholder="Estimated dispatch: 24 to 48 hours with live tracking"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                                  Bullet Point 3
                                </label>
                                <input
                                  type="text"
                                  value={current.tab3_point3 || ''}
                                  onChange={(e) => handleUpdateArtworkTab('tab3_point3', e.target.value)}
                                  placeholder="Unboxing inspection and 14-day hassle-free returns"
                                  style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Trust Badges */}
                        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Award size={15} color="#d97706" /> Product Page Trust Badges (3 Visual Cards)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                            {/* Badge 1 */}
                            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                {renderAdminBadgeIcon(current.badge1_icon, 'shield')}
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 1</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                                <select
                                  value={current.badge1_icon || 'shield-check'}
                                  onChange={(e) => handleUpdateArtworkTab('badge1_icon', e.target.value)}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                  {BADGE_ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                                <input
                                  type="text"
                                  value={current.badge1_title || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge1_title', e.target.value)}
                                  placeholder="100% Authentic"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                                <input
                                  type="text"
                                  value={current.badge1_subtitle || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge1_subtitle', e.target.value)}
                                  placeholder="Certificate included"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>

                            {/* Badge 2 */}
                            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                {renderAdminBadgeIcon(current.badge2_icon, 'truck')}
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 2</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                                <select
                                  value={current.badge2_icon || 'truck'}
                                  onChange={(e) => handleUpdateArtworkTab('badge2_icon', e.target.value)}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                  {BADGE_ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                                <input
                                  type="text"
                                  value={current.badge2_title || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge2_title', e.target.value)}
                                  placeholder="Free Insured Transit"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                                <input
                                  type="text"
                                  value={current.badge2_subtitle || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge2_subtitle', e.target.value)}
                                  placeholder="Reinforced art crating"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>

                            {/* Badge 3 */}
                            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                {renderAdminBadgeIcon(current.badge3_icon, 'rotate')}
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 3</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                                <select
                                  value={current.badge3_icon || 'rotate-ccw'}
                                  onChange={(e) => handleUpdateArtworkTab('badge3_icon', e.target.value)}
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                                >
                                  {BADGE_ICON_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                                <input
                                  type="text"
                                  value={current.badge3_title || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge3_title', e.target.value)}
                                  placeholder="14-Day In-Home Trial"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                                <input
                                  type="text"
                                  value={current.badge3_subtitle || ''}
                                  onChange={(e) => handleUpdateArtworkTab('badge3_subtitle', e.target.value)}
                                  placeholder="Satisfaction guarantee"
                                  style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* CARD 7: Real-Time Live Preview */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                      7. Real-Time Storefront Footer Preview
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      This preview updates live as you type, reflecting the exact design rendered for collectors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveFooterConfig}
                    disabled={isSavingFooter}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '2px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Settings
                  </button>
                </div>

                <div style={{
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid #e5e3dc',
                }}>
                  <div style={{
                    backgroundColor: '#f3f2ee',
                    color: '#4b5563',
                    padding: '36px 24px 20px',
                    fontFamily: "'Roboto Condensed', sans-serif",
                  }}>
                    {/* Columns Preview */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '28px',
                      marginBottom: '30px',
                    }}>
                      {/* Col 1: Brand */}
                      <div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: '#111827',
                          letterSpacing: '-0.02em',
                          marginBottom: '4px',
                          lineHeight: 1.15,
                        }}>
                          {footerConfig.brand_name || ''}
                        </div>

                        {footerConfig.brand_subtitle && (
                          <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6b7280',
                            letterSpacing: '0.02em',
                            marginBottom: '10px',
                          }}>
                            {footerConfig.brand_subtitle}
                          </div>
                        )}

                        <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#6b7280', marginBottom: '14px' }}>
                          {footerConfig.brand_description}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#4b5563' }}>
                          {footerConfig.studio_location && (
                            <div>📍 {footerConfig.studio_location}</div>
                          )}
                          {footerConfig.contact_phone && (
                            <div>📞 {footerConfig.contact_phone}</div>
                          )}
                          {footerConfig.contact_email && (
                            <div>✉️ {footerConfig.contact_email}</div>
                          )}
                        </div>
                      </div>

                      {/* Col 2: Shop / Custom Links */}
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700, fontSize: '14.5px', marginBottom: '14px' }}>
                          {footerConfig.custom_column_title || 'Shop'}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#4b5563' }}>
                          {(footerConfig.custom_links && footerConfig.custom_links.length > 0) ? (
                            footerConfig.custom_links.map((l, idx) => (
                              <li key={idx}>{l.title}</li>
                            ))
                          ) : (
                            <>
                              <li>All Artworks</li>
                              <li>Best Sellers</li>
                              <li>New Arrivals</li>
                              <li>Featured Collection</li>
                            </>
                          )}
                        </ul>
                      </div>

                      {/* Col 3: Categories */}
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700, fontSize: '14.5px', marginBottom: '14px' }}>
                          {footerConfig.categories_title || 'Collections'}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#4b5563' }}>
                          {categories.slice(0, footerConfig.max_categories_to_show).map((cat) => (
                            <li key={cat.id}>{cat.name}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Col 4: Connect With Us */}
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700, fontSize: '14.5px', marginBottom: '14px' }}>
                          {footerConfig.social_links?.section_title || 'Connect With Us'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                          <div style={{ padding: '5px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e3dc', fontWeight: 600, color: '#374151' }}>
                            📸 Instagram {footerConfig.social_links?.instagram ? '✓' : ''}
                          </div>
                          <div style={{ padding: '5px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e3dc', fontWeight: 600, color: '#374151' }}>
                            👥 Facebook {footerConfig.social_links?.facebook ? '✓' : ''}
                          </div>
                          <div style={{ padding: '5px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e3dc', fontWeight: 600, color: '#374151' }}>
                            💬 WhatsApp {footerConfig.social_links?.whatsapp ? '✓' : ''}
                          </div>
                          <div style={{ padding: '5px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e3dc', fontWeight: 600, color: '#374151' }}>
                            🐦 Twitter / X {footerConfig.social_links?.twitter ? '✓' : ''}
                          </div>
                          {footerConfig.social_links?.youtube && (
                            <div style={{ padding: '5px 10px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e5e3dc', fontWeight: 600, color: '#374151' }}>
                              ▶️ YouTube ✓
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Col 5: Newsletter */}
                      <div>
                        <div style={{ color: '#111827', fontWeight: 700, fontSize: '14.5px', marginBottom: '14px' }}>
                          {footerConfig.newsletter_title || 'Subscribe for 10% Off'}
                        </div>
                        <p style={{ fontSize: '12.5px', color: '#6b7280', marginBottom: '12px', lineHeight: 1.5 }}>
                          {footerConfig.newsletter_description}
                        </p>
                        <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #d5d3cb' }}>
                          <span style={{ fontSize: '12px', color: '#9ca3af', padding: '6px 10px', backgroundColor: '#ffffff', flex: 1 }}>{footerConfig.newsletter_placeholder || 'Enter your email'}</span>
                          <span style={{ backgroundColor: '#1b3b2b', color: '#ffffff', padding: '6px 12px', fontSize: '12px', fontWeight: 700 }}>Join</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div style={{
                      borderTop: '1px solid #e5e3dc',
                      paddingTop: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#9ca3af',
                    }}>
                      <div>{footerConfig.copyright_text}</div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Sitemap</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS & ADMIN PROFILE */}
          {navSection === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Bar */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    <Settings size={18} color="#000000" /> Admin Profile & System Settings
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Manage administrator profile credentials, reset login password, and review database configurations.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadAllAdminData}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '2px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} /> Refresh Data
                </button>
              </div>

              {/* STORE BRANDING & LOGO SECTION */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '2px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      <Store size={18} color="#000000" /> Store Branding &amp; Official Logo
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Upload your official store logo and customize brand identity displayed on the storefront header, navigation bar, and footer.
                    </p>
                  </div>
                </div>

                {storeBrandingSuccessMsg && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    borderRadius: '2px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <ShieldCheck size={16} color="#15803d" /> {storeBrandingSuccessMsg}
                  </div>
                )}

                {storeBrandingErrorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    borderRadius: '2px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    marginBottom: '18px',
                  }}>
                    {storeBrandingErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSaveStoreBranding}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {/* Column 1: Logo Upload & Image Preview */}
                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000', display: 'block', marginBottom: '8px' }}>
                        Store Logo Image
                      </label>

                      {/* Logo Preview & Upload Box */}
                      <div style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '4px',
                        padding: '20px',
                        backgroundColor: '#fafafa',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        minHeight: '140px',
                        position: 'relative',
                        transition: 'border-color 0.2s ease',
                      }}>
                        {footerConfig.brand_logo_url ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                            <div style={{
                              padding: '12px 20px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              maxWidth: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <img
                                src={footerConfig.brand_logo_url}
                                alt={footerConfig.brand_name || 'Store Logo'}
                                style={{
                                  maxHeight: '60px',
                                  maxWidth: '220px',
                                  objectFit: 'contain',
                                  display: 'block',
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                              <label
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  backgroundColor: '#000000',
                                  color: '#ffffff',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                                }}
                              >
                                {uploadingLogo ? (
                                  <>
                                    <RefreshCw size={12} className="animate-spin" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload size={12} /> Replace Logo
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                                  onChange={handleLogoFileUpload}
                                  disabled={uploadingLogo}
                                  style={{ display: 'none' }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={handleRemoveLogo}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 12px',
                                  backgroundColor: '#ffffff',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  borderRadius: '2px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                              width: '100%',
                              padding: '16px 0',
                            }}
                          >
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              backgroundColor: '#f4f4f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#52525b',
                              marginBottom: '8px',
                            }}>
                              {uploadingLogo ? <RefreshCw size={20} className="animate-spin" /> : <Upload size={20} />}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>
                              {uploadingLogo ? 'Uploading logo...' : 'Click to Upload Store Logo'}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#71717a', marginTop: '2px' }}>
                              PNG, SVG, JPG, WebP (Transparent background recommended)
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                              onChange={handleLogoFileUpload}
                              disabled={uploadingLogo}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Direct URL input fallback */}
                      <div style={{ marginTop: '12px' }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                          Or Direct Image / CDN URL:
                        </label>
                        <input
                          type="text"
                          value={footerConfig.brand_logo_url || ''}
                          onChange={(e) => setFooterConfig({ ...footerConfig, brand_logo_url: e.target.value })}
                          placeholder="https://example.com/logo.png"
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '2px',
                            border: '1px solid #e5e7eb',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                            color: '#09090b',
                          }}
                        />
                      </div>
                    </div>

                    {/* Column 2: Brand Name, Subtitle & Live Storefront Preview */}
                    <div>
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000', display: 'block', marginBottom: '6px' }}>
                          Store / Brand Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={footerConfig.brand_name || ''}
                          onChange={(e) => setFooterConfig({ ...footerConfig, brand_name: e.target.value })}
                          placeholder="e.g. Artsgfg (leave blank to show only logo)"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '2px',
                            border: '1px solid #e5e7eb',
                            fontSize: '13px',
                            fontWeight: 600,
                            boxSizing: 'border-box',
                            color: '#09090b',
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#71717a', marginTop: '3px', display: 'block' }}>
                          Optional: If your uploaded logo already has text/brand name, you can leave this blank.
                        </span>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000', display: 'block', marginBottom: '6px' }}>
                          Subtitle / Tagline (Optional)
                        </label>
                        <input
                          type="text"
                          value={footerConfig.brand_subtitle || ''}
                          onChange={(e) => setFooterConfig({ ...footerConfig, brand_subtitle: e.target.value })}
                          placeholder="e.g. DESIGNDFG"
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: '2px',
                            border: '1px solid #e5e7eb',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            color: '#09090b',
                          }}
                        />
                      </div>

                      {/* Logo Width Customizer */}
                      <div style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                            Logo Width: <span style={{ color: '#000000', fontWeight: 800 }}>{footerConfig.social_links?.logo_width || 240}px</span>
                          </label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[180, 220, 260, 300].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setFooterConfig({
                                  ...footerConfig,
                                  social_links: { ...(footerConfig.social_links || {}), logo_width: preset }
                                })}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  borderRadius: '2px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: (footerConfig.social_links?.logo_width || 240) === preset ? '#000000' : '#ffffff',
                                  color: (footerConfig.social_links?.logo_width || 240) === preset ? '#ffffff' : '#334155',
                                  cursor: 'pointer',
                                }}
                              >
                                {preset}px
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="140"
                          max="380"
                          step="10"
                          value={footerConfig.social_links?.logo_width || 240}
                          onChange={(e) => setFooterConfig({
                            ...footerConfig,
                            social_links: { ...(footerConfig.social_links || {}), logo_width: Number(e.target.value) }
                          })}
                          style={{ width: '100%', cursor: 'pointer', accentColor: '#000000' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                          <span>140px (Compact)</span>
                          <span>240px (Default)</span>
                          <span>380px (Extra Wide)</span>
                        </div>
                      </div>

                      {/* Live Storefront Navbar Header Preview */}
                      <div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                          Live Storefront Navbar Preview
                        </span>
                        <div style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          padding: '14px 18px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          minHeight: '64px',
                        }}>
                          {footerConfig.brand_logo_url ? (
                            <img
                              src={footerConfig.brand_logo_url}
                              alt={footerConfig.brand_name || 'Logo'}
                              style={{
                                height: 'auto',
                                maxHeight: '56px',
                                width: (footerConfig.brand_name || footerConfig.brand_subtitle)
                                  ? 'auto'
                                  : `${footerConfig.social_links?.logo_width || 240}px`,
                                maxWidth: (footerConfig.brand_name || footerConfig.brand_subtitle)
                                  ? `${Math.max(160, Number(footerConfig.social_links?.logo_width) || 200)}px`
                                  : `${Math.max(280, Number(footerConfig.social_links?.logo_width) || 280)}px`,
                                objectFit: 'contain',
                                borderRadius: '4px',
                                display: 'block',
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: '#1b3b2b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              boxShadow: '0 2px 6px rgba(27, 59, 43, 0.25)',
                              flexShrink: 0,
                            }}>
                              <ShoppingBag size={18} strokeWidth={2.2} />
                            </div>
                          )}

                          {/* Only render text if brand name or subtitle is provided, or if no logo is uploaded */}
                          {(footerConfig.brand_name || footerConfig.brand_subtitle || !footerConfig.brand_logo_url) && (
                            <div style={{ minWidth: 0 }}>
                              {(footerConfig.brand_name || !footerConfig.brand_logo_url) && (
                                <div style={{
                                  fontSize: '18px',
                                  fontWeight: 800,
                                  letterSpacing: '-0.02em',
                                  color: '#111827',
                                  lineHeight: 1.1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {footerConfig.brand_name || 'Your Brand Name'}
                                </div>
                              )}
                              {footerConfig.brand_subtitle && (
                                <div style={{
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  color: '#6b7280',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  marginTop: '2px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}>
                                  {footerConfig.brand_subtitle}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #f4f4f5', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={isSavingBranding || uploadingLogo}
                      style={{
                        padding: '9px 20px',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: (isSavingBranding || uploadingLogo) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isSavingBranding ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Saving Store Branding...
                        </>
                      ) : (
                        <>
                          <Store size={13} /> Save Store Branding &amp; Logo
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2-Column Grid: Admin Profile Details & Password Reset */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                {/* CARD 1: Admin Profile Details */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {/* Admin Visual Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #f4f4f5',
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      border: '1px solid #000000',
                      flexShrink: 0,
                    }}>
                      {adminUser?.full_name
                        ? adminUser.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                        : 'AD'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#000000', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {adminUser?.full_name || 'Administrator'}
                        </h3>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <ShieldCheck size={12} color="#ffffff" /> {adminUser?.role || 'ADMIN'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#71717a', marginTop: '2px' }}>
                        {adminUser?.email || 'admin@artweb.com'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} /> Member Since: {adminUser?.created_at ? new Date(adminUser.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'September 2026'}
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#000000', marginBottom: '16px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Profile Information
                    </h4>

                    {profileSuccessMsg && (
                      <div style={{
                        padding: '9px 12px',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #e5e7eb',
                        color: '#000000',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        <CheckCircle2 size={15} color="#000000" /> {profileSuccessMsg}
                      </div>
                    )}

                    {profileErrorMsg && (
                      <div style={{
                        padding: '9px 12px',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #000000',
                        color: '#000000',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginBottom: '16px',
                      }}>
                        {profileErrorMsg}
                      </div>
                    )}

                    <form onSubmit={handleUpdateAdminProfile}>
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminProfileForm.full_name}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, full_name: e.target.value })}
                          required
                          placeholder="e.g. Gallery Curator"
                          style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          value={adminProfileForm.email}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                          required
                          placeholder="admin@artweb.com"
                          style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                          Phone / WhatsApp Contact
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={adminProfileForm.phone}
                          onChange={(e) => setAdminProfileForm({ ...adminProfileForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '20px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                            Street Address
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminProfileForm.address}
                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, address: e.target.value })}
                            placeholder="124 Museum Way"
                            style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                            City
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={adminProfileForm.city}
                            onChange={(e) => setAdminProfileForm({ ...adminProfileForm, city: e.target.value })}
                            placeholder="Chennai / Mumbai"
                            style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        style={{
                          width: '100%',
                          padding: '9px 16px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          borderRadius: '2px',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" /> Saving Changes...
                          </>
                        ) : (
                          <>Save Profile Details</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* CARD 2: Password Reset */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '2px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#000000', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      <KeyRound size={17} color="#000000" /> Reset Admin Password
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '6px 0 0 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                      Change your password credentials securely. Enter your current password (if set) and choose a strong new password.
                    </p>
                  </div>

                  {passwordSuccessMsg && (
                    <div style={{
                      padding: '9px 12px',
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #e5e7eb',
                      color: '#000000',
                      borderRadius: '2px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <CheckCircle2 size={15} color="#000000" /> {passwordSuccessMsg}
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div style={{
                      padding: '9px 12px',
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #000000',
                      color: '#000000',
                      borderRadius: '2px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {passwordErrorMsg}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                        Current Password (Optional if already authenticated)
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                        placeholder="Enter current password"
                        style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                        New Password * (Min 6 characters)
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Enter new strong password"
                        style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: '#000000' }}>
                        Confirm New Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        required
                        minLength={6}
                        placeholder="Re-enter new password"
                        style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '12.5px' }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#52525b', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                        />
                        <span>Show password characters</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      style={{
                        width: '100%',
                        padding: '9px 16px',
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '2px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChangingPassword ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Updating Password...
                        </>
                      ) : (
                        <>
                          <Lock size={13} /> Update Admin Password
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Artwork Modal */}
      {showPaintingModal && (
        <div
          onClick={() => setShowPaintingModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              border: '1px solid #e5e7eb',
              padding: '28px 32px 30px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: '0 0 5px 0' }}>
                {editingPainting ? 'Edit Product' : 'Add Product'}
              </h3>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Add or update merchandise, pricing, stock levels, and publication status.
              </p>
            </div>

            <form onSubmit={handleSavePainting}>
              {/* Image Upload Area — 3 slots */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#000000', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Product Images <span style={{ color: '#71717a', fontWeight: 400, textTransform: 'none' }}>(max 3)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {/* Slot 1 — Primary (required) */}
                  {(['image_url', 'image_url_2', 'image_url_3'] as const).map((slot, idx) => {
                    const imgVal = formData[slot];
                    const label = idx === 0 ? 'Main Image *' : `Image ${idx + 1}`;
                    return (
                      <div
                        key={slot}
                        style={{
                          border: `1px dashed ${idx === 0 ? '#000000' : '#d4d4d8'}`,
                          borderRadius: '2px',
                          backgroundColor: '#fafafa',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          minHeight: '130px',
                          position: 'relative',
                          justifyContent: imgVal ? 'flex-start' : 'center',
                        }}
                      >
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: idx === 0 ? '#000000' : '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start' }}>{label}</span>
                        {imgVal ? (
                          <>
                            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                              <img
                                src={imgVal}
                                alt={`Product ${idx + 1}`}
                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200'; }}
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, [slot]: '' })}
                                style={{
                                  position: 'absolute', top: '-6px', right: '-6px',
                                  width: '20px', height: '20px', borderRadius: '2px',
                                  backgroundColor: '#000000', color: '#ffffff', border: 'none',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                }}
                                title="Remove image"
                              >
                                <X size={11} />
                              </button>
                            </div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Upload size={11} /> Replace
                              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingImage}
                                onChange={slot === 'image_url' ? handleImageFileUpload : (e) => handleImageFileUploadSlot(e, slot as 'image_url_2' | 'image_url_3')} />
                            </label>
                          </>
                        ) : (
                          <>
                            <Upload size={20} strokeWidth={1.5} color="#71717a" />
                            <label style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 12px', backgroundColor: '#ffffff',
                              border: '1px solid #000000', borderRadius: '2px',
                              fontSize: '11.5px', fontWeight: 600, color: '#000000',
                              cursor: uploadingImage ? 'not-allowed' : 'pointer',
                            }}>
                              <Upload size={11} color="#000000" />
                              {uploadingImage ? '...' : 'Upload'}
                              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingImage}
                                onChange={slot === 'image_url' ? handleImageFileUpload : (e) => handleImageFileUploadSlot(e, slot as 'image_url_2' | 'image_url_3')} />
                            </label>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Name (Full Width) */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cotton Blouse, Silk Saree"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: '#000000',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Row: Category & Brand Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Category *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      style={{
                        flex: 1,
                        height: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        padding: '0 10px',
                        fontSize: '13px',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      required
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddCategoryPrompt}
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#000000',
                      }}
                      title="Add New Category"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (formData.category_id) {
                          handleDeleteCategoryPrompt(Number(formData.category_id));
                        } else {
                          alert('Please select a category first to delete it.');
                        }
                      }}
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: formData.category_id ? 'pointer' : 'default',
                        color: formData.category_id ? '#000000' : '#d4d4d8',
                      }}
                      title="Delete Selected Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBP, Banarasi"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      padding: '0 12px',
                      fontSize: '13px',
                      color: '#000000',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Row: Store Section & Medium / Material */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Store Section
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={formData.section_id}
                      onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                      style={{
                        flex: 1,
                        height: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        padding: '0 10px',
                        fontSize: '13px',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">General Catalog</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddSectionPrompt}
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#000000',
                      }}
                      title="Add New Store Section"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (formData.section_id) {
                          handleDeleteSection(Number(formData.section_id));
                        } else {
                          alert('Please select a store section first to delete it.');
                        }
                      }}
                      style={{
                        width: '38px',
                        height: '38px',
                        minWidth: '38px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: formData.section_id ? 'pointer' : 'default',
                        color: formData.section_id ? '#000000' : '#d4d4d8',
                      }}
                      title="Delete Selected Store Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Medium / Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cotton, Pure Silk"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    style={{
                      width: '100%',
                      height: '38px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '2px',
                      padding: '0 12px',
                      fontSize: '13px',
                      color: '#000000',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Regular Pricing Section with Toggle Chevron */}
              <div style={{ marginTop: '20px', marginBottom: '14px' }}>
                <div
                  onClick={() => setIsPricingExpanded(!isPricingExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '14px', fontWeight: 700, color: '#000000', margin: 0 }}>
                    Regular Pricing & Details
                  </h4>
                  <ChevronDown
                    size={17}
                    color="#000000"
                    style={{
                      transform: isPricingExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>

                {isPricingExpanded && (
                  <div style={{ paddingTop: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1800"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '2px',
                            padding: '0 12px',
                            fontSize: '13px',
                            color: '#000000',
                            boxSizing: 'border-box',
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          MRP (Actual Price)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2400 (Struck-out)"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '2px',
                            padding: '0 12px',
                            fontSize: '13px',
                            color: '#000000',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Dimensions / Size *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 38, 40, Free Size"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          style={{
                            width: '100%',
                            height: '38px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '2px',
                            padding: '0 12px',
                            fontSize: '13px',
                            color: '#000000',
                            boxSizing: 'border-box',
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the merchandise, fabric, color harmony, and fit..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{
                          width: '100%',
                          border: '1px solid #e5e7eb',
                          borderRadius: '2px',
                          padding: '10px 12px',
                          fontSize: '13px',
                          color: '#000000',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {/* Inventory & Status Checkboxes */}
                    <div style={{ display: 'flex', gap: '18px', margin: '12px 0', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', fontWeight: 600, color: '#000000' }}>
                        <input
                          type="checkbox"
                          checked={formData.status !== 'inactive'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'available' : 'inactive' })}
                          style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#000000' }}
                        />
                        <span>Active (Available in Store)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', fontWeight: 500, color: '#71717a' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_framed}
                          onChange={(e) => setFormData({ ...formData, is_framed: e.target.checked })}
                          style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#000000' }}
                        />
                        <span>Custom Framing / Packaging</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', fontWeight: 500, color: '#71717a' }}>
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#000000' }}
                        />
                        <span>Feature on Catalog</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '18px',
                  borderTop: '1px solid #e5e7eb',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPaintingModal(false)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 22px',
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {editingPainting ? 'Update Product' : '+ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT HERO BANNER */}
      {showBannerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '2px',
            border: '1px solid #e5e7eb',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: 0 }}>
                  {editingBanner ? 'Edit Hero Banner Content' : 'Create New Hero Banner'}
                </h3>
                <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Update the headline, tag badge, description, image, artist and pricing shown on the hero banner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#000000', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBanner}>
              {/* Category / Promo Tag */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Category / Promo Tag *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABSTRACT & MODERN CURATION"
                  value={bannerFormData.tag}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, tag: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                  required
                />
              </div>

              {/* Main Headline Title */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Headline Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Modern Expressionism"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                  required
                />
              </div>

              {/* Description Paragraph */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description Paragraph *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Banner promotional text..."
                  value={bannerFormData.description}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                  required
                />
              </div>

              {/* Button Text, Artist, Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Button Text *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="SHOP NOW"
                    value={bannerFormData.button_text}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, button_text: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MARCUS VANCE"
                    value={bannerFormData.artist_name}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, artist_name: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Display Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="2800"
                    min="0"
                    step="1"
                    value={bannerFormData.price}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, price: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    required
                  />
                </div>
              </div>

              {/* Color Configuration */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px', padding: '14px', backgroundColor: '#fafafa', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Section Background Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.bg_color || '#f3f2ee'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #e5e7eb', borderRadius: '2px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                      value={bannerFormData.bg_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                      placeholder="#f3f2ee"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Backdrop Circle Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.circle_color || '#eedcd5'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, circle_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #e5e7eb', borderRadius: '2px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                      value={bannerFormData.circle_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, circle_color: e.target.value })}
                      placeholder="#eedcd5"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Headline & Text Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.text_color || '#ffffff'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, text_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #e5e7eb', borderRadius: '2px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                      value={bannerFormData.text_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, text_color: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Artwork Image URL and File Upload */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Artwork Image URL or File Upload *
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerFormData.image_url}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, image_url: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    required
                  />
                  <label style={{
                    padding: '8px 14px',
                    borderRadius: '2px',
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Upload size={13} /> {uploadingBannerImage ? 'Uploading...' : 'Browse'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleBannerImageUpload}
                    />
                  </label>
                </div>
                {bannerFormData.image_url && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={bannerFormData.image_url}
                      alt="Preview"
                      style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    />
                    <span style={{ fontSize: '12px', color: '#000000', fontWeight: 600 }}>
                      ✓ Image preview loaded
                    </span>
                  </div>
                )}
              </div>

              {/* Order & Active Status */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', padding: '12px', backgroundColor: '#fafafa', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bannerFormData.is_active}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, is_active: e.target.checked })}
                    style={{ accentColor: '#000000' }}
                  />
                  <span style={{ fontWeight: 700, color: '#000000' }}>
                    Active (Show in Homepage Hero Slider)
                  </span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <label style={{ fontWeight: 600, color: '#000000' }}>Display Order:</label>
                  <input
                    type="number"
                    style={{ width: '60px', padding: '4px 8px', borderRadius: '2px', border: '1px solid #e5e7eb' }}
                    value={bannerFormData.display_order}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Save Hero Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Store Section Modal */}
      {showSectionModal && (
        <div
          onClick={() => setShowSectionModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowSectionModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#000000',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: '0 0 6px 0' }}>
              {editingSection ? 'Edit Store Section' : 'Create New Store Section'}
            </h3>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Configure section name and display position. Products assigned to this section will appear in its dedicated section block on the storefront.
            </p>

            <form onSubmit={handleSaveSection}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Section Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Best Sellers, New Arrivals, Hot Sales, Curators Choice"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description (Optional subtitle on storefront)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Brief description of the artworks curated in this section..."
                  value={sectionFormData.description}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
              </div>

              {/* Section Cover Image with Upload & Live Preview */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Section Cover Image (For Storefront Themes Cards)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  {/* Live Preview Box */}
                  <div style={{
                    width: '80px',
                    height: '60px',
                    minWidth: '80px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {sectionFormData.image_url ? (
                      <img
                        src={sectionFormData.image_url}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Layers size={22} color="#71717a" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #000000',
                        borderRadius: '2px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#000000',
                      }}>
                        <Upload size={13} />
                        {uploadingSectionImage ? 'Uploading Image...' : 'Upload Image File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSectionImageFileUpload}
                          style={{ display: 'none' }}
                          disabled={uploadingSectionImage}
                        />
                      </label>
                      {sectionFormData.image_url && (
                        <button
                          type="button"
                          onClick={() => setSectionFormData({ ...sectionFormData, image_url: '' })}
                          style={{
                            padding: '7px 12px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            color: '#71717a',
                            borderRadius: '2px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '4px' }}>
                      PNG, JPG, or WEBP cover image for the section card on the storefront
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  className="form-control"
                  placeholder="Or paste external image URL: https://images.unsplash.com/..."
                  value={sectionFormData.image_url}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, image_url: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={sectionFormData.display_order}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, display_order: parseInt(e.target.value) || 1 })}
                    min={1}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>
                    1 is displayed first at the top
                  </span>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', marginTop: '16px' }}>
                    <input
                      type="checkbox"
                      checked={sectionFormData.is_active}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, is_active: e.target.checked })}
                      style={{ accentColor: '#000000' }}
                    />
                    <span style={{ fontWeight: 700, color: '#000000' }}>
                      {sectionFormData.is_active ? 'Active (Visible on Store)' : 'Hidden'}
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {editingSection ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
        <div
          onClick={() => setShowCategoryModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowCategoryModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#000000',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: '0 0 6px 0' }}>
              {editingCategory ? 'Edit Collection' : 'Create New Collection'}
            </h3>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Configure collection details and upload a cover thumbnail displayed in the storefront &quot;Collection&quot; circular badges.
            </p>

            <form onSubmit={handleSaveCategory}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Collection Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Oil Painting, Abstract & Modern, Acrylics"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Collection Slug (Optional, auto-generated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. oil-painting (optional)"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                />
              </div>

              {/* Category Cover Image with Live Preview */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Collection Cover Image (For Storefront Circle)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  {/* Live Circle Preview */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    minWidth: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {categoryFormData.image_url ? (
                      <img
                        src={categoryFormData.image_url}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 700, color: '#000000' }}>
                        {categoryFormData.name ? categoryFormData.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #000000',
                      borderRadius: '2px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#000000',
                    }}>
                      <Upload size={13} />
                      {uploadingCategoryImage ? 'Uploading Image...' : 'Upload Image File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageFileUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingCategoryImage}
                      />
                    </label>
                    <span style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '4px' }}>
                      PNG, JPG, or WEBP (Square or circle recommended)
                    </span>
                  </div>
                </div>

                <input
                  type="url"
                  className="form-control"
                  placeholder="Or paste external image URL: https://images.unsplash.com/..."
                  value={categoryFormData.image_url}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image_url: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Brief description of this artwork collection..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {editingCategory ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {showTestimonialModal && (
        <div
          onClick={() => setShowTestimonialModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '30px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowTestimonialModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#000000',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: '0 0 6px 0' }}>
              {editingTestimonial ? 'Edit Patron Testimonial' : 'Add New Patron Testimonial'}
            </h3>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0' }}>
              Add authentic reviews and patron quotes to feature in the &quot;What Our Patrons Say&quot; showcase.
            </p>

            <form onSubmit={handleSaveTestimonial}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Patron Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Meera Iyer, Rhea Kapoor"
                    value={testimonialFormData.name}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Chennai, Mumbai"
                    value={testimonialFormData.location}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, location: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '38px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Rating (Stars)
                  </label>
                  <select
                    className="form-control"
                    value={testimonialFormData.rating}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })}
                    style={{ height: '38px', borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={testimonialFormData.display_order}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, display_order: parseInt(e.target.value) || 1 })}
                    min={1}
                    style={{ height: '38px', borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Testimonial Quote *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g., The custom silk artwork sat perfectly. The finish and textures were thoroughly taken seriously..."
                  value={testimonialFormData.quote}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, quote: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={testimonialFormData.is_active}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, is_active: e.target.checked })}
                    style={{ accentColor: '#000000' }}
                  />
                  <span style={{ fontWeight: 700, color: '#000000' }}>
                    {testimonialFormData.is_active ? 'Active (Visible on Storefront)' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  {editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add / Edit Showcase Item Modal */}
      {showShowcaseModal && (
        <div
          onClick={() => setShowShowcaseModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '30px',
              backgroundColor: '#ffffff',
              borderRadius: '2px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setShowShowcaseModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#000000',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 700, color: '#000000', margin: '0 0 6px 0' }}>
              {editingShowcase ? 'Edit Showcase Photo' : 'Add Showcase Photo'}
            </h3>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>
              Upload a promotional image to display in the marquee showcase track next to the countdown timer.
            </p>

            <form onSubmit={handleSaveShowcase}>
              {/* Image Upload & Preview */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Showcase Photo *
                </label>
                
                {showcaseFormData.image_url && (
                  <div style={{
                    width: '100%',
                    height: '160px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img
                      src={showcaseFormData.image_url}
                      alt="Showcase preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '2px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#111827',
                      cursor: uploadingShowcaseImage ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Upload size={14} />
                    {uploadingShowcaseImage ? 'Uploading Image...' : 'Choose File from Computer'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleShowcaseImageUpload}
                      disabled={uploadingShowcaseImage}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>Or paste image web URL directly:</span>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={showcaseFormData.image_url}
                    onChange={(e) => setShowcaseFormData({ ...showcaseFormData, image_url: e.target.value })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '36px', fontSize: '12.5px', width: '100%', marginTop: '4px' }}
                    required
                  />
                </div>
              </div>

              {/* Tag / Badge */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Badge / Tag (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., FEATURED, TRENDING, NEW SEASON, CURATED"
                  value={showcaseFormData.tag}
                  onChange={(e) => setShowcaseFormData({ ...showcaseFormData, tag: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '36px', fontSize: '13px', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {['FEATURED', 'TRENDING', 'NEW SEASON', 'LIMITED', 'CURATED'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setShowcaseFormData({ ...showcaseFormData, tag: t })}
                      style={{
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        borderRadius: '2px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: showcaseFormData.tag === t ? '#1b3b2b' : '#f9fafb',
                        color: showcaseFormData.tag === t ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Title / Headline (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Spring Summer Atelier Collection"
                  value={showcaseFormData.title}
                  onChange={(e) => setShowcaseFormData({ ...showcaseFormData, title: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '36px', fontSize: '13px', width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                  Short Subtitle / Description (Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Bespoke handcrafted silk creations"
                  value={showcaseFormData.description}
                  onChange={(e) => setShowcaseFormData({ ...showcaseFormData, description: e.target.value })}
                  style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '36px', fontSize: '13px', width: '100%' }}
                />
              </div>

              {/* Display Order & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '11.5px', fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={showcaseFormData.display_order}
                    onChange={(e) => setShowcaseFormData({ ...showcaseFormData, display_order: parseInt(e.target.value) || 1 })}
                    style={{ borderRadius: '2px', border: '1px solid #e5e7eb', height: '36px', fontSize: '13px', width: '100%' }}
                  />
                </div>

                <div style={{ paddingTop: '18px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#000000' }}>
                    <input
                      type="checkbox"
                      checked={showcaseFormData.is_active}
                      onChange={(e) => setShowcaseFormData({ ...showcaseFormData, is_active: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#000000' }}
                    />
                    Active on Storefront
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowShowcaseModal(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '2px',
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingShowcaseImage}
                  style={{
                    padding: '8px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#000000',
                    border: '1px solid #000000',
                    borderRadius: '2px',
                    color: '#ffffff',
                    cursor: uploadingShowcaseImage ? 'not-allowed' : 'pointer',
                  }}
                >
                  {editingShowcase ? 'Save Changes' : 'Add to Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK WHATSAPP CONCIERGE NUMBER MODAL */}
      {showWhatsappModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '480px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                }}>
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Configure WhatsApp Number
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    Used for customer direct WhatsApp inquiries and order concierge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsappModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {whatsappSaveSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '16px',
              }}>
                <CheckCircle2 size={16} /> WhatsApp number updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveWhatsappNumber}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#374151', marginBottom: '6px' }}>
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  value={tempWhatsappNumber}
                  onChange={(e) => setTempWhatsappNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or 919876543210"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1.5px solid #d1d5db',
                    borderRadius: '4px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontWeight: 500,
                  }}
                  autoFocus
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', lineHeight: '1.4' }}>
                  💡 Include country code (e.g. <code>+91</code> for India). When visitors click <strong>"Direct Inquiry on WhatsApp"</strong> on any artwork page, it will open WhatsApp with this phone number directly.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                <button
                  type="button"
                  onClick={() => setShowWhatsappModal(false)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWhatsapp}
                  style={{
                    padding: '9px 22px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: '#16a34a',
                    border: '1px solid #16a34a',
                    borderRadius: '4px',
                    color: '#ffffff',
                    cursor: isSavingWhatsapp ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isSavingWhatsapp ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save WhatsApp Number'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: EDIT ARTWORK TABS & TRUST BADGES */}
      {showArtworkTabsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '840px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb',
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#000000', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Configure Artwork Detail Tabs &amp; Badges
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                    Edit the headings, COA certificate info, shipping terms, and trust badges on all product detail pages
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArtworkTabsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {(() => {
                const current = getArtworkTabs();
                return (
                  <form onSubmit={handleSaveArtworkTabs} id="artwork-tabs-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Tab 1 */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={15} color="#2563eb" /> Information Tab 1: Overview &amp; Curatorial Note
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                          Tab 1 Title / Heading
                        </label>
                        <input
                          type="text"
                          value={current.tab1_title || ''}
                          onChange={(e) => handleUpdateArtworkTab('tab1_title', e.target.value)}
                          placeholder="Curatorial Note"
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                        <span style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px', display: 'block' }}>
                          Note: This tab automatically presents the individual artwork's medium, dimensions, category, and curator description.
                        </span>
                      </div>
                    </div>

                    {/* Tab 2 */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={15} color="#16a34a" /> Information Tab 2: Provenance &amp; Authenticity (COA)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                            Tab 2 Title / Heading
                          </label>
                          <input
                            type="text"
                            value={current.tab2_title || ''}
                            onChange={(e) => handleUpdateArtworkTab('tab2_title', e.target.value)}
                            placeholder="Provenance & COA"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                            Statement / Introduction Text (Use <code>{'{artist}'}</code> to automatically insert the artwork's artist name)
                          </label>
                          <textarea
                            rows={2}
                            value={current.tab2_intro || ''}
                            onChange={(e) => handleUpdateArtworkTab('tab2_intro', e.target.value)}
                            placeholder="Every acquisition from our gallery includes a registered, tamper-evident Certificate of Authenticity (COA) signed directly by {artist} and counter-stamped by our Chief Curator."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 1
                            </label>
                            <input
                              type="text"
                              value={current.tab2_point1 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab2_point1', e.target.value)}
                              placeholder="Official gallery archive serial registration number"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 2
                            </label>
                            <input
                              type="text"
                              value={current.tab2_point2 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab2_point2', e.target.value)}
                              placeholder="Archival acid-free cotton certificate backing"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 3
                            </label>
                            <input
                              type="text"
                              value={current.tab2_point3 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab2_point3', e.target.value)}
                              placeholder="Guaranteed museum provenance with transfer of ownership"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tab 3 */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={15} color="#0284c7" /> Information Tab 3: White-Glove Shipping
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                            Tab 3 Title / Heading
                          </label>
                          <input
                            type="text"
                            value={current.tab3_title || ''}
                            onChange={(e) => handleUpdateArtworkTab('tab3_title', e.target.value)}
                            placeholder="White-Glove Shipping"
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                            Statement / Introduction Text
                          </label>
                          <textarea
                            rows={2}
                            value={current.tab3_intro || ''}
                            onChange={(e) => handleUpdateArtworkTab('tab3_intro', e.target.value)}
                            placeholder="We ensure museum-grade protective packaging using shock-absorbing archival foam and custom wood casing."
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 1
                            </label>
                            <input
                              type="text"
                              value={current.tab3_point1 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab3_point1', e.target.value)}
                              placeholder="Complimentary insured door-to-door courier across India"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 2
                            </label>
                            <input
                              type="text"
                              value={current.tab3_point2 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab3_point2', e.target.value)}
                              placeholder="Estimated dispatch: 24 to 48 hours with live tracking"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '3px' }}>
                              Bullet Point 3
                            </label>
                            <input
                              type="text"
                              value={current.tab3_point3 || ''}
                              onChange={(e) => handleUpdateArtworkTab('tab3_point3', e.target.value)}
                              placeholder="Unboxing inspection and 14-day hassle-free returns"
                              style={{ width: '100%', padding: '7px 10px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={15} color="#d97706" /> Product Page Trust Badges (3 Visual Cards)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {/* Badge 1 */}
                        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            {renderAdminBadgeIcon(current.badge1_icon, 'shield')}
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 1</span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                            <select
                              value={current.badge1_icon || 'shield-check'}
                              onChange={(e) => handleUpdateArtworkTab('badge1_icon', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                            >
                              {BADGE_ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                            <input
                              type="text"
                              value={current.badge1_title || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge1_title', e.target.value)}
                              placeholder="100% Authentic"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                            <input
                              type="text"
                              value={current.badge1_subtitle || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge1_subtitle', e.target.value)}
                              placeholder="Certificate included"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        {/* Badge 2 */}
                        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            {renderAdminBadgeIcon(current.badge2_icon, 'truck')}
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 2</span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                            <select
                              value={current.badge2_icon || 'truck'}
                              onChange={(e) => handleUpdateArtworkTab('badge2_icon', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                            >
                              {BADGE_ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                            <input
                              type="text"
                              value={current.badge2_title || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge2_title', e.target.value)}
                              placeholder="Free Insured Transit"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                            <input
                              type="text"
                              value={current.badge2_subtitle || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge2_subtitle', e.target.value)}
                              placeholder="Reinforced art crating"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        {/* Badge 3 */}
                        <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '2px', border: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            {renderAdminBadgeIcon(current.badge3_icon, 'rotate')}
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>Badge 3</span>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Icon</label>
                            <select
                              value={current.badge3_icon || 'rotate-ccw'}
                              onChange={(e) => handleUpdateArtworkTab('badge3_icon', e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                            >
                              {BADGE_ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Title</label>
                            <input
                              type="text"
                              value={current.badge3_title || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge3_title', e.target.value)}
                              placeholder="14-Day In-Home Trial"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '2px' }}>Subtitle</label>
                            <input
                              type="text"
                              value={current.badge3_subtitle || ''}
                              onChange={(e) => handleUpdateArtworkTab('badge3_subtitle', e.target.value)}
                              placeholder="Satisfaction guarantee"
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '2px', border: '1px solid #d1d5db', fontSize: '12px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            }}>
              <button
                type="button"
                onClick={() => setShowArtworkTabsModal(false)}
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveArtworkTabs()}
                disabled={isSavingFooter}
                style={{
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#000000',
                  border: '1px solid #000000',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: isSavingFooter ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isSavingFooter ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  'Save Artwork Tabs & Badges'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
