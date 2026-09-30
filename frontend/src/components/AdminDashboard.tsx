import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Painting, Category, Inquiry, AdminStats, User, Banner, ProductSection, Testimonial, FooterConfig, FeatureBadge, CustomFooterLink } from '../types';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
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
  Truck
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize active section with URL path
  const getSectionFromPath = (): 'overview' | 'products' | 'inquiries' | 'users' | 'banners' | 'sections' | 'categories' | 'testimonials' | 'footer' | 'settings' => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/inquiries')) return 'inquiries';
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/banners')) return 'banners';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('');

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
    brand_name: 'shopbypriya',
    brand_subtitle: 'HANDCRAFTED SILK & READY-TO-SHIP BLOUSES',
    brand_description: 'Atelier blouses for sarees. Ready-made and made to measure.',
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
    contact_email: 'hello@shopbypriya.com',
    social_links: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      whatsapp: '+91 98765 43210',
    },
  });
  const [isSavingFooter, setIsSavingFooter] = useState(false);
  const [footerSaveSuccess, setFooterSaveSuccess] = useState(false);

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

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paintingsData, categoriesData, inquiriesData, statsData, usersData, bannersData, sectionsData, testimonialsData, footerData] = await Promise.all([
        api.getPaintings(),
        api.getCategories(),
        api.getAllInquiries(),
        api.getAdminStats(),
        api.getAllUsers(),
        api.getAllBannersAdmin(),
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
      setSections(sectionsData);
      setTestimonials(testimonialsData);
      if (footerData) {
        setFooterConfig(footerData);
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
      const fullUrl = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
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
    if (!window.confirm(`Are you sure you want to delete category "${cat?.name || ''}"? Artworks assigned to this category will remain in your store under unassigned category.`)) {
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
      const fullUrl = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
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
      setFooterSaveSuccess(true);
      setTimeout(() => setFooterSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save footer settings');
    } finally {
      setIsSavingFooter(false);
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
      const fullUrl = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
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
      const fullUrl = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
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
      const fullUrl = res.url.startsWith('http') ? res.url : `http://localhost:8080${res.url}`;
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

  // Calculate monthly overview heights for the bar chart
  const barChartHeights = [35, 45, 65, 85, 40, 95, 30, 75, 55, 60, 48, 80];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#fbfbfb',
      color: '#09090b',
      fontFamily: "'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* 1. Left Sidebar (Shadcn UI style - Fixed/Static) */}
      <aside style={{
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
      }}>
        <div>
          {/* Workspace Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            marginBottom: '28px',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#09090b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
            }}>
              ✦
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#09090b', letterSpacing: '-0.01em' }}>
                ArtGallery
              </div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>
                Enterprise Portal
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'overview' ? '#f4f4f5' : 'transparent',
                color: navSection === 'overview' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'overview' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/admin/products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'products' ? '#f4f4f5' : 'transparent',
                color: navSection === 'products' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'products' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={16} />
                Products & Art
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#e4e4e7',
                color: '#18181b',
                fontWeight: 700,
              }}>
                {paintings.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/inquiries')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'inquiries' ? '#f4f4f5' : 'transparent',
                color: navSection === 'inquiries' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'inquiries' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardList size={16} />
                Inquiries & CRM
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                fontWeight: 700,
              }}>
                {inquiries.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'users' ? '#f4f4f5' : 'transparent',
                color: navSection === 'users' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'users' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} />
                Users
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                fontWeight: 700,
              }}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/banners')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'banners' ? '#f4f4f5' : 'transparent',
                color: navSection === 'banners' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'banners' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ImageIcon size={16} />
                Hero Banners
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontWeight: 700,
              }}>
                {banners.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/sections')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'sections' ? '#f4f4f5' : 'transparent',
                color: navSection === 'sections' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'sections' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={16} />
                Store Sections
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                fontWeight: 700,
              }}>
                {sections.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/categories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'categories' ? '#f4f4f5' : 'transparent',
                color: navSection === 'categories' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'categories' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FolderTree size={16} />
                Categories
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#fce7f3',
                color: '#be185d',
                fontWeight: 700,
              }}>
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/testimonials')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'testimonials' ? '#f4f4f5' : 'transparent',
                color: navSection === 'testimonials' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'testimonials' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Quote size={16} />
                Testimonials
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                fontWeight: 700,
              }}>
                {testimonials.length}
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/footer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'footer' ? '#f4f4f5' : 'transparent',
                color: navSection === 'footer' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'footer' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PanelBottom size={16} />
                Footer
              </div>
              <span style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#e0e7ff',
                color: '#4338ca',
                fontWeight: 700,
              }}>
                Live
              </span>
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                background: navSection === 'settings' ? '#f4f4f5' : 'transparent',
                color: navSection === 'settings' ? '#09090b' : '#71717a',
                fontWeight: navSection === 'settings' ? 700 : 500,
                fontSize: '13.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
              }}
            >
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Bottom: Return to Store button */}
        <div>
          <button
            onClick={onBackToStore}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #e4e4e7',
              backgroundColor: '#ffffff',
              color: '#09090b',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Store size={15} />
            Return to Store
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
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          {/* Breadcrumb / Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f4f4f5',
              padding: '6px 14px',
              borderRadius: '6px',
              width: '260px',
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

            {/* User Avatar */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#09090b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
            }}>
              AD
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main style={{ padding: '32px 36px', overflowY: 'auto', flex: 1 }}>
          {/* Dynamic Section Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '6px' }}>
              {navSection === 'overview' && 'Dashboard'}
              {navSection === 'products' && 'Products & Artwork'}
              {navSection === 'inquiries' && 'Inquiries & CRM'}
              {navSection === 'users' && 'Users & Accounts'}
              {navSection === 'settings' && 'Store Settings'}
            </h1>

            {navSection === 'overview' ? (
              /* Sub-nav Pill Selectors (Exact match from Shadcn screenshot) */
              <div style={{
                display: 'inline-flex',
                backgroundColor: '#f4f4f5',
                padding: '4px',
                borderRadius: '8px',
                gap: '4px',
                marginTop: '6px',
              }}>
                {(['overview', 'analytics', 'reports', 'notifications'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    style={{
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: '6px',
                      backgroundColor: activeSubTab === tab ? '#ffffff' : 'transparent',
                      color: activeSubTab === tab ? '#09090b' : '#71717a',
                      fontWeight: activeSubTab === tab ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: activeSubTab === tab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      textTransform: 'capitalize',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13.5px', color: '#71717a', margin: '4px 0 0' }}>
                {navSection === 'products' && 'Manage painting prices, framing, inventory status, and live active toggle in PostgreSQL.'}
                {navSection === 'inquiries' && 'Customer acquisition inquiries and orders placed from the shopping cart.'}
                {navSection === 'users' && 'View all registered customers, collectors, and admins stored in PostgreSQL.'}
                {navSection === 'settings' && 'Database connection and currency configuration.'}
              </p>
            )}
          </div>

          {/* VIEW 1: OVERVIEW (Exact Shadcn Layout from Screenshot) */}
          {navSection === 'overview' && (
            <div>
              {/* 4 Metric Cards in a Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}>
                {/* 1. Total Revenue Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '22px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Total Revenue</span>
                    <span style={{ color: '#71717a', fontSize: '14px' }}>₹</span>
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {formatPrice(stats?.estimated_pipeline_value || 45231)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>+20.1%</span> from last month
                  </div>
                </div>

                {/* 2. Subscriptions / Inquiries Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '22px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Inquiries CRM</span>
                    <Users size={16} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    +{stats?.total_inquiries || inquiries.length || 235}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>+180.1%</span> from last month
                  </div>
                </div>

                {/* 3. Sales / Confirmed Orders Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '22px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Sales Orders</span>
                    <CreditCard size={16} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    +{stats?.confirmed_orders || 12}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>+19%</span> from last month
                  </div>
                </div>

                {/* 4. Active Now / In Stock Card */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '22px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Available Art</span>
                    <Activity size={16} color="#71717a" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    +{stats?.available_paintings || paintings.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>+201</span> since last hour
                  </div>
                </div>
              </div>

              {/* Bottom Cards: Left (Overview Bar Chart) + Right (Recent Sales) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.1fr',
                gap: '20px',
              }}>
                {/* Left Card: Overview Bar Chart (Exact replica from Shadcn screenshot) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', marginBottom: '20px' }}>
                    Overview
                  </h3>

                  {/* Visual Bar Chart */}
                  <div style={{ display: 'flex', height: '240px', alignItems: 'flex-end', gap: '16px' }}>
                    {/* Y-axis labels */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '210px',
                      fontSize: '11px',
                      color: '#71717a',
                      paddingRight: '8px',
                    }}>
                      <span>₹60,000</span>
                      <span>₹45,000</span>
                      <span>₹30,000</span>
                      <span>₹15,000</span>
                      <span>₹0</span>
                    </div>

                    {/* Bars for each month */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '210px', paddingBottom: '20px', borderBottom: '1px solid #e4e4e7' }}>
                      {months.map((m, idx) => (
                        <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div
                            style={{
                              width: '26px',
                              height: `${barChartHeights[idx]}%`,
                              backgroundColor: '#09090b',
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.4s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e53637')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#09090b')}
                            title={`${m}: ${barChartHeights[idx] * 600}`}
                          />
                          <span style={{ fontSize: '11px', color: '#71717a', position: 'absolute', bottom: '0px' }}>
                            {m}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Card: Recent Sales / Recent Inquiries (Exact replica from Shadcn screenshot) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', margin: 0 }}>
                      Recent Inquiries & Orders
                    </h3>
                    <p style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>
                      You made {inquiries.length} inquiries this month.
                    </p>
                  </div>

                  {/* List of Recent Sales */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {inquiries.length > 0 ? (
                      inquiries.slice(0, 5).map((inq) => {
                        const initials = inq.customer_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);

                        return (
                          <div key={inq.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                              }}>
                                {initials || 'CU'}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                                  {inq.customer_name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#71717a' }}>
                                  {inq.customer_email} • {inq.customer_phone}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#09090b' }}>
                              +{formatPrice(inq.quoted_price)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Sample placeholders matching screenshot
                      [
                        { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: 1999.00 },
                        { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: 39.00 },
                        { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: 299.00 },
                        { name: 'William Kim', email: 'will@email.com', amount: 99.00 },
                        { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: 39.00 },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                            }}>
                              {item.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#71717a' }}>
                                {item.email}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#09090b' }}>
                            +{formatPrice(item.amount)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PRODUCTS / INVENTORY (Shadcn Data Table) */}
          {navSection === 'products' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b' }}>
                    Artwork Catalog
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    Manage painting prices, framing, inventory status, and imagery in PostgreSQL.
                  </p>
                </div>
                <button onClick={openAddPaintingModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={15} /> Add Artwork
                </button>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>IMAGE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>TITLE & ARTIST</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STORE SECTION</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>MEDIUM</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>PRICE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paintings.map((p) => {
                      const assignedSection = sections.find((s) => s.id === p.section_id) || p.section;
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <img
                              src={p.image_url}
                              alt={p.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e4e4e7' }}
                            />
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#09090b' }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: '#71717a' }}>{p.artist_name}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {assignedSection ? (
                              <span style={{
                                fontSize: '11px',
                                padding: '3px 8px',
                                borderRadius: '999px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                fontWeight: 700,
                              }}>
                                {assignedSection.name}
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#a1a1aa' }}>General</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#71717a' }}>
                            {p.medium}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#09090b' }}>
                            {formatPrice(p.price)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                              {/* Interactive Toggle Switch */}
                              <button
                                type="button"
                                role="switch"
                                aria-checked={p.status !== 'inactive'}
                                onClick={() => handleToggleProductStatus(p)}
                                title={p.status !== 'inactive' ? 'Product is Active. Click to make Inactive (hides buying option)' : 'Product is Inactive. Click to make Active (enables buying option)'}
                                style={{
                                  width: '42px',
                                  height: '24px',
                                  borderRadius: '999px',
                                  backgroundColor: p.status !== 'inactive' ? '#16a34a' : '#d4d4d8',
                                  border: 'none',
                                  cursor: 'pointer',
                                  position: 'relative',
                                  padding: '2px',
                                  transition: 'background-color 0.2s ease',
                                  outline: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <span
                                  style={{
                                    display: 'block',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                    transition: 'transform 0.2s ease',
                                    transform: p.status !== 'inactive' ? 'translateX(18px)' : 'translateX(1px)',
                                  }}
                                />
                              </button>

                              {/* Status text badge */}
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                  color: p.status !== 'inactive' ? '#166534' : '#71717a',
                                  backgroundColor: p.status !== 'inactive' ? '#dcfce7' : '#f4f4f5',
                                  padding: '3px 8px',
                                  borderRadius: '999px',
                                  border: p.status !== 'inactive' ? '1px solid #bbf7d0' : '1px solid #e4e4e7',
                                }}
                              >
                                {p.status !== 'inactive' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => openEditPaintingModal(p)}
                                style={{
                                  background: '#f4f4f5',
                                  border: '1px solid #e4e4e7',
                                  borderRadius: '4px',
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  color: '#09090b',
                                }}
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeletePainting(p.id)}
                                style={{
                                  background: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '4px',
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                }}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: INQUIRIES & CRM (Shadcn Data Table) */}
          {navSection === 'inquiries' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b' }}>
                    Customer Inquiries & Cart Requests
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    Direct CRM inquiries with 1-click WhatsApp messaging and status updates.
                  </p>
                </div>
                <select
                  value={inquiryStatusFilter}
                  onChange={(e) => setInquiryStatusFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #e4e4e7',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    color: '#09090b',
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

              {/* Inquiries Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>CODE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>CUSTOMER</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>ARTWORK</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>QUOTE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>CONTACT</th>
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
                              <div style={{ fontWeight: 800, color: '#e53637', fontSize: '13.5px' }}>
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
                              <div style={{ fontWeight: 700, color: '#09090b', fontSize: '14px' }}>{inq.customer_name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#09090b', fontWeight: 600, marginTop: '2px' }}>
                                <Phone size={12} color="#e53637" />
                                <a href={`tel:${inq.customer_phone}`} style={{ color: '#09090b', textDecoration: 'none' }}>
                                  {inq.customer_phone}
                                </a>
                              </div>
                              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '1px' }}>{inq.customer_email}</div>
                              <div style={{ fontSize: '12px', color: '#71717a' }}>{inq.shipping_address}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#09090b' }}>
                                {inq.painting?.title || 'Original Art'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#71717a' }}>
                                ID: #{inq.painting_id}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#09090b' }}>
                              {formatPrice(inq.quoted_price)}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <select
                                value={inq.status}
                                onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  borderRadius: '4px',
                                  border: '1px solid #e4e4e7',
                                  backgroundColor: '#ffffff',
                                  color: '#09090b',
                                  fontWeight: 600,
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
                                    borderRadius: '4px',
                                    backgroundColor: '#25D366',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '12px',
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
                                    borderRadius: '4px',
                                    backgroundColor: '#f4f4f5',
                                    border: '1px solid #e4e4e7',
                                    color: '#09090b',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                  }}
                                >
                                  <Phone size={12} /> Call Now
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

          {/* VIEW: USERS MANAGEMENT (Shadcn Data Table) */}
          {navSection === 'users' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="#09090b" />
                    Users & Collector Accounts
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    View all registered customers, collectors, and admins stored in PostgreSQL.
                  </p>
                </div>

                {/* Search & Role Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#f4f4f5',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e4e4e7',
                    width: '220px',
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
                        fontSize: '12.5px',
                        color: '#09090b',
                        width: '100%',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{
                      padding: '7px 12px',
                      fontSize: '13px',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      color: '#09090b',
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
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>USER</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>CONTACT & LOCATION</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>ROLE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>REGISTERED DATE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
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
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  backgroundColor: u.role === 'admin' ? '#09090b' : '#f4f4f5',
                                  color: u.role === 'admin' ? '#ffffff' : '#18181b',
                                  border: '1px solid #e4e4e7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  flexShrink: 0,
                                }}>
                                  {initials}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#09090b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {u.full_name}
                                    {u.role === 'admin' && (
                                      <span title="Administrator" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <ShieldCheck size={14} color="#e53637" />
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#09090b', fontSize: '13px' }}>
                                  <Phone size={12} color="#e53637" />
                                  <a href={`tel:${u.phone}`} style={{ color: '#09090b', textDecoration: 'none' }}>
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
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                backgroundColor: u.role === 'admin' ? '#09090b' : '#eff6ff',
                                color: u.role === 'admin' ? '#ffffff' : '#1d4ed8',
                                border: u.role === 'admin' ? 'none' : '1px solid #bfdbfe',
                              }}>
                                {u.role}
                              </span>
                            </td>

                            {/* Status Active / Inactive Toggle Switch */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={u.is_active}
                                  onClick={() => handleToggleUserActive(u)}
                                  title={u.is_active ? 'Click to deactivate account' : 'Click to activate account'}
                                  style={{
                                    width: '38px',
                                    height: '22px',
                                    borderRadius: '999px',
                                    backgroundColor: u.is_active ? '#16a34a' : '#d4d4d8',
                                    border: 'none',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: '2px',
                                    transition: 'background-color 0.2s ease',
                                    outline: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <span
                                    style={{
                                      display: 'block',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#ffffff',
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                      transition: 'transform 0.2s ease',
                                      transform: u.is_active ? 'translateX(16px)' : 'translateX(1px)',
                                    }}
                                  />
                                </button>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  color: u.is_active ? '#166534' : '#71717a',
                                }}>
                                  {u.is_active ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </td>

                            {/* Registered Date */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: '12.5px', color: '#09090b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Calendar size={12} color="#71717a" />
                                {new Date(u.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </td>

                            {/* Actions / Direct Contact */}
                            <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                {whatsappUrl && (
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 9px',
                                      borderRadius: '4px',
                                      backgroundColor: '#25D366',
                                      color: '#ffffff',
                                      textDecoration: 'none',
                                      fontWeight: 700,
                                      fontSize: '11.5px',
                                    }}
                                    title="WhatsApp user"
                                  >
                                    <MessageCircle size={12} /> WhatsApp
                                  </a>
                                )}
                                {u.phone && (
                                  <a
                                    href={`tel:${u.phone}`}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 9px',
                                      borderRadius: '4px',
                                      backgroundColor: '#f4f4f5',
                                      border: '1px solid #e4e4e7',
                                      color: '#09090b',
                                      textDecoration: 'none',
                                      fontWeight: 600,
                                      fontSize: '11.5px',
                                    }}
                                    title="Call user"
                                  >
                                    <Phone size={12} /> Call
                                  </a>
                                )}
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
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Homepage Hero Banners
                  </h2>
                  <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
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
                      borderRadius: '6px',
                      border: '1px solid #e4e4e7',
                      backgroundColor: '#ffffff',
                      color: '#09090b',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>

                  <button
                    onClick={openAddBannerModal}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#09090b',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Add Hero Banner
                  </button>
                </div>
              </div>

              {/* Live Preview Card */}
              {banners.filter(b => b.is_active).length > 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
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
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: '#71717a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <Sun size={14} color="#e53637" /> Live Homepage Hero Preview &mdash;
                      <span style={{ color: '#09090b', fontWeight: 800, textTransform: 'none', fontSize: '13px' }}>
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
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#e53637' }}>
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
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
                      All Configured Hero Banners ({banners.length})
                    </div>
                    {/* <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                      💡 Click any banner row or click &quot;Preview&quot; to show that banner in the top hero preview box.
                    </div> */}
                  </div>
                  <div style={{ fontSize: '12px', color: '#71717a' }}>
                    Active banners will rotate in the homepage hero slider
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>COLORS & ARTWORK</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>PROMO TAG & HEADLINE</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>ARTIST & DISPLAY PRICE</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>BUTTON TEXT</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700 }}>STATUS</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
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
                                backgroundColor: isCurrentlyPreviewed ? '#f0f9ff' : 'transparent',
                                transition: 'background-color 0.15s ease',
                              }}
                              title="Click to view this banner in the top preview"
                            >
                              {/* Artwork Image, Circle Swatch & BG Swatch */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    position: 'relative',
                                    width: '54px',
                                    height: '54px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: b.bg_color || '#f3f2ee',
                                    borderRadius: '6px',
                                    border: isCurrentlyPreviewed ? '2px solid #0284c7' : '1px solid #e4e4e7',
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
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{
                                  color: '#e53637',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  letterSpacing: '0.08em',
                                  textTransform: 'uppercase',
                                  marginBottom: '2px',
                                }}>
                                  {b.tag}
                                </div>
                                {/* <div style={{ fontWeight: 700, color: '#09090b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {b.title}
                                  {isCurrentlyPreviewed && (
                                    <span style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      backgroundColor: '#0284c7',
                                      color: '#ffffff',
                                      fontWeight: 800,
                                    }}>
                                      PREVIEWING
                                    </span>
                                  )}
                                </div> */}
                                <div style={{ fontSize: '12px', color: '#71717a', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {b.description}
                                </div>
                              </td>

                              {/* Artist & Price */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#09090b', fontSize: '13px' }}>
                                  {b.artist_name}
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#e53637', marginTop: '2px' }}>
                                  {formatPrice(b.price)}
                                </div>
                              </td>

                              {/* Button Text */}
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#f4f4f5',
                                  borderRadius: '4px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: '#18181b',
                                  border: '1px solid #e4e4e7',
                                }}>
                                  {b.button_text}
                                </span>
                              </td>

                              {/* Active Switch */}
                              <td style={{ padding: '12px 16px' }}>
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
                                      backgroundColor: b.is_active ? '#16a34a' : '#d4d4d8',
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
                                    color: b.is_active ? '#166534' : '#71717a',
                                  }}>
                                    {b.is_active ? 'Active' : 'Hidden'}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  {/* <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPreviewBannerId(b.id);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '6px 11px',
                                      borderRadius: '4px',
                                      backgroundColor: isCurrentlyPreviewed ? '#0284c7' : '#f4f4f5',
                                      border: isCurrentlyPreviewed ? '1px solid #0284c7' : '1px solid #e4e4e7',
                                      color: isCurrentlyPreviewed ? '#ffffff' : '#09090b',
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      fontSize: '12px',
                                      transition: 'all 0.15s ease',
                                    }}
                                    title="Show this banner in the top preview"
                                  >
                                    <Eye size={13} /> {isCurrentlyPreviewed ? 'Previewing' : 'Preview'}
                                  </button> */}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditBannerModal(b);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '6px 11px',
                                      borderRadius: '4px',
                                      backgroundColor: '#f4f4f5',
                                      border: '1px solid #e4e4e7',
                                      color: '#09090b',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px',
                                    }}
                                  >
                                    <Edit size={13} /> Edit Content
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBanner(b.id);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '6px 10px',
                                      borderRadius: '4px',
                                      backgroundColor: '#fee2e2',
                                      border: '1px solid #fecaca',
                                      color: '#dc2626',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '12px',
                                    }}
                                    title="Delete Hero Banner"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
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

          {/* VIEW 5: STORE PRODUCT SECTIONS */}
          {navSection === 'sections' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b' }}>
                    Store Product Sections
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    Manage sections (e.g. Best Sellers, New Arrivals, Hot Sales). Each section is displayed one by one on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddSectionModal}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> Add New Section
                </button>
              </div>

              {/* Sections Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700, width: '60px' }}>ORDER</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, width: '70px' }}>IMAGE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>SECTION NAME</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>SLUG</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>ASSIGNED ARTWORKS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.length > 0 ? (
                      sections.map((sec) => {
                        const count = paintings.filter((p) => p.section_id === sec.id).length;
                        return (
                          <tr key={sec.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                            <td style={{ padding: '14px', fontWeight: 800, color: '#71717a' }}>
                              #{sec.display_order}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{
                                width: '48px',
                                height: '36px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
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
                                  <Layers size={16} color="#94a3b8" />
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: 800, fontSize: '14px', color: '#09090b' }}>
                                {sec.name}
                              </div>
                            </td>
                            <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '12.5px', color: '#71717a' }}>
                              /{sec.slug}
                            </td>
                            <td style={{ padding: '14px', color: '#52525b', fontSize: '13px', maxWidth: '300px' }}>
                              {sec.description || '—'}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                backgroundColor: count > 0 ? '#e0f2fe' : '#f4f4f5',
                                color: count > 0 ? '#0369a1' : '#71717a',
                                fontWeight: 700,
                                fontSize: '12px',
                              }}>
                                <ShoppingBag size={12} />
                                {count} {count === 1 ? 'artwork' : 'artworks'}
                              </span>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor: sec.is_active ? '#dcfce7' : '#f4f4f5',
                                color: sec.is_active ? '#15803d' : '#71717a',
                              }}>
                                {sec.is_active ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => openEditSectionModal(sec)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f4f4f5',
                                    border: '1px solid #e4e4e7',
                                    color: '#09090b',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                  }}
                                  title="Edit Section"
                                >
                                  <Edit size={13} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(sec.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                  }}
                                  title="Delete Section"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
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
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b' }}>
                    Product Categories
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    Manage art categories and upload cover images for the circular storefront category pills and filters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> Add New Category
                </button>
              </div>

              {/* Categories Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700, width: '70px' }}>IMAGE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>CATEGORY NAME</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>SLUG</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>DESCRIPTION</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>ASSIGNED ARTWORKS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
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
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e4e4e7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                              }}>
                                {displayImg ? (
                                  <img
                                    src={displayImg}
                                    alt={cat.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <span style={{ fontWeight: 800, color: '#64748b', fontSize: '16px' }}>
                                    {cat.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '14px' }}>
                              <div style={{ fontWeight: 800, fontSize: '14px', color: '#09090b' }}>
                                {cat.name}
                              </div>
                            </td>
                            <td style={{ padding: '14px', fontFamily: 'monospace', fontSize: '12.5px', color: '#71717a' }}>
                              /{cat.slug}
                            </td>
                            <td style={{ padding: '14px', color: '#52525b', fontSize: '13px', maxWidth: '300px' }}>
                              {cat.description || '—'}
                            </td>
                            <td style={{ padding: '14px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                backgroundColor: count > 0 ? '#fce7f3' : '#f4f4f5',
                                color: count > 0 ? '#be185d' : '#71717a',
                                fontWeight: 700,
                                fontSize: '12px',
                              }}>
                                <ShoppingBag size={12} />
                                {count} {count === 1 ? 'artwork' : 'artworks'}
                              </span>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => openEditCategoryModal(cat)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    backgroundColor: '#f4f4f5',
                                    border: '1px solid #e4e4e7',
                                    color: '#09090b',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                  }}
                                  title="Edit Category"
                                >
                                  <Edit size={13} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '12px',
                                  }}
                                  title="Delete Category"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#71717a' }}>
                          No categories found. Click &quot;Add New Category&quot; to create one.
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
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b' }}>
                    Patron Testimonials & Reviews
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>
                    Manage collector testimonials displayed in &quot;What Our Patrons Say&quot; on the storefront.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddTestimonialModal}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} /> Add New Testimonial
                </button>
              </div>

              {/* Testimonials Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e4e4e7', color: '#71717a' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 700, width: '60px' }}>ORDER</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>PATRON</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>RATING</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>TESTIMONIAL QUOTE</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                      <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.length > 0 ? (
                      testimonials.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f4f4f5' }}>
                          <td style={{ padding: '14px', fontWeight: 800, color: '#71717a' }}>
                            #{t.display_order}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#09090b' }}>
                              {t.name}
                            </div>
                            {t.location && (
                              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                                {t.location}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <span key={i} style={{ fontSize: '14px' }}>★</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '14px', color: '#334155', fontSize: '13px', maxWidth: '380px', fontStyle: 'italic' }}>
                            &ldquo;{t.quote}&rdquo;
                          </td>
                          <td style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleTestimonialActive(t.id)}
                                title={t.is_active ? 'Click to hide' : 'Click to show'}
                                style={{
                                  width: '36px',
                                  height: '20px',
                                  borderRadius: '999px',
                                  backgroundColor: t.is_active ? '#16a34a' : '#d4d4d8',
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
                                color: t.is_active ? '#166534' : '#71717a',
                              }}>
                                {t.is_active ? 'Active' : 'Hidden'}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => openEditTestimonialModal(t)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  backgroundColor: '#f4f4f5',
                                  border: '1px solid #e4e4e7',
                                  color: '#09090b',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                                title="Edit Testimonial"
                              >
                                <Edit size={13} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonial(t.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: '#fee2e2',
                                  border: '1px solid #fecaca',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                                title="Delete Testimonial"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
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
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                padding: '20px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PanelBottom size={20} color="#e53637" /> Global Storefront Footer Settings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
                    Customize every section of the storefront footer: value-prop badges, brand description, categories, custom links, newsletter, and copyright.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {footerSaveSuccess && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#166534',
                      backgroundColor: '#dcfce7',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}>
                      <CheckCircle2 size={16} /> Saved Successfully!
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
                      padding: '10px 20px',
                      backgroundColor: '#09090b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: isSavingFooter ? 'not-allowed' : 'pointer',
                      opacity: isSavingFooter ? 0.7 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSavingFooter ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>Save Footer Settings</>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 1: Value-Proposition Badges (Top 3 Badges) */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
                  1. Top Highlight Badges (Value Propositions)
                </h4>
                <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>
                  The 3 cards displayed at the very top of the footer (e.g. Free Insured Delivery, Authenticity Guarantee, 30-Day Returns).
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '18px',
                }}>
                  {[0, 1, 2].map((idx) => {
                    const badge = (footerConfig.feature_badges || [])[idx] || {
                      icon: idx === 0 ? 'truck' : idx === 1 ? 'shield' : 'refresh',
                      title: '',
                      subtitle: '',
                    };
                    return (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid #f4f4f5',
                          backgroundColor: '#fafafa',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#e53637', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Badge #{idx + 1}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ fontSize: '12px', color: '#71717a', fontWeight: 600 }}>Icon:</label>
                            <select
                              value={badge.icon || 'truck'}
                              onChange={(e) => handleUpdateBadge(idx, 'icon', e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #d4d4d8',
                                fontSize: '12px',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              <option value="truck">Truck (Delivery)</option>
                              <option value="shield">Shield (Authenticity)</option>
                              <option value="refresh">Refresh (Returns)</option>
                              <option value="award">Award (Curated)</option>
                              <option value="sparkles">Sparkles (Exclusive)</option>
                              <option value="package">Package (Custom Crates)</option>
                              <option value="clock">Clock (24/7 Advisory)</option>
                              <option value="gem">Gem (Provenance)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
                            Badge Title
                          </label>
                          <input
                            type="text"
                            value={badge.title}
                            onChange={(e) => handleUpdateBadge(idx, 'title', e.target.value)}
                            placeholder="e.g. FREE GLOBAL INSURED DELIVERY"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d4d4d8',
                              fontSize: '13px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
                            Badge Subtitle
                          </label>
                          <input
                            type="text"
                            value={badge.subtitle}
                            onChange={(e) => handleUpdateBadge(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. Climate-controlled custom art crates"
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid #d4d4d8',
                              fontSize: '13px',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CARD 2: Brand Information & Payment Badges */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
                  2. Brand Identity & Payment Logos
                </h4>
                <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>
                  First column content in the footer: brand title, mission tagline, and payment provider logos.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                      Brand Title (Logo Text)
                    </label>
                    <input
                      type="text"
                      value={footerConfig.brand_name}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_name: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d4d4d8',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        marginBottom: '14px',
                      }}
                    />

                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#d97706', display: 'block', marginBottom: '6px' }}>
                      Golden Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={footerConfig.brand_subtitle || ''}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_subtitle: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #fcd34d',
                        backgroundColor: '#fffbeb',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#92400e',
                        boxSizing: 'border-box',
                        marginBottom: '14px',
                      }}
                    />

                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                      Brand Description
                    </label>
                    <textarea
                      rows={3}
                      value={footerConfig.brand_description}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brand_description: e.target.value })}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #d4d4d8',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #f4f4f5',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
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
                          borderRadius: '6px',
                          border: '1px solid #d4d4d8',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
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
                          borderRadius: '6px',
                          border: '1px solid #d4d4d8',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '4px' }}>
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
                          borderRadius: '6px',
                          border: '1px solid #d4d4d8',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ paddingTop: '8px', borderTop: '1px solid #e4e4e7' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={footerConfig.show_payment_methods}
                          onChange={(e) => setFooterConfig({ ...footerConfig, show_payment_methods: e.target.checked })}
                        />
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#09090b' }}>
                          Display Payment Logos Badge
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3 & 4: Categories & Custom Links Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Categories Column Config */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
                    3. Curated Categories Column
                  </h4>
                  <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                    Second column header and limits for categories loaded from database.
                  </p>

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.categories_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, categories_title: e.target.value })}
                    placeholder="CURATED CATEGORIES"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                    }}
                  />

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
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
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      marginBottom: '12px',
                    }}
                  />

                  <div style={{
                    padding: '10px 12px',
                    backgroundColor: '#f4f4f5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#71717a',
                  }}>
                    💡 Current active categories in your store: <strong>{categories.length}</strong>. The footer will dynamically show up to the top {footerConfig.max_categories_to_show} categories.
                  </div>
                </div>

                {/* Custom Column (Curation Desk) */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      4. Custom Column (Curation Desk)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddCustomLink}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #d4d4d8',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        color: '#09090b',
                      }}
                    >
                      <Plus size={13} /> Add Link
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                    Third column custom advisory &amp; service links.
                  </p>

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.custom_column_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, custom_column_title: e.target.value })}
                    placeholder="CURATION DESK"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
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
                            borderRadius: '4px',
                            border: '1px solid #d4d4d8',
                            fontSize: '12.5px',
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
                            borderRadius: '4px',
                            border: '1px solid #d4d4d8',
                            fontSize: '12.5px',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomLink(idx)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title="Remove link"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD 5 & 6: Newsletter & Copyright */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Newsletter Column Config */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
                    5. Newsletter Subscription Column
                  </h4>
                  <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                    Fourth column newsletter pitch and input placeholder.
                  </p>

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Column Header Title
                  </label>
                  <input
                    type="text"
                    value={footerConfig.newsletter_title}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_title: e.target.value })}
                    placeholder="NEWSLETTER"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                    }}
                  />

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Newsletter Pitch / Description
                  </label>
                  <textarea
                    rows={3}
                    value={footerConfig.newsletter_description}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_description: e.target.value })}
                    placeholder="Be the first to know about new arrivals..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      marginBottom: '14px',
                    }}
                  />

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Email Input Placeholder
                  </label>
                  <input
                    type="text"
                    value={footerConfig.newsletter_placeholder}
                    onChange={(e) => setFooterConfig({ ...footerConfig, newsletter_placeholder: e.target.value })}
                    placeholder="Your email"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Copyright & Direct Contact Info */}
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '10px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
                    6. Copyright &amp; Advisory Contact
                  </h4>
                  <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
                    Bottom bar copyright notice and optional contact advisory info.
                  </p>

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Copyright Bar Text
                  </label>
                  <input
                    type="text"
                    value={footerConfig.copyright_text}
                    onChange={(e) => setFooterConfig({ ...footerConfig, copyright_text: e.target.value })}
                    placeholder="Copyright © 2026 All rights reserved | Art Gallery Curations & Studio"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      marginBottom: '16px',
                    }}
                  />

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Direct WhatsApp / Phone Contact
                  </label>
                  <input
                    type="text"
                    value={footerConfig.contact_phone || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, contact_phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      marginBottom: '14px',
                    }}
                  />

                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#3f3f46', display: 'block', marginBottom: '6px' }}>
                    Advisory Inquiries Email
                  </label>
                  <input
                    type="email"
                    value={footerConfig.contact_email || ''}
                    onChange={(e) => setFooterConfig({ ...footerConfig, contact_email: e.target.value })}
                    placeholder="curation@artgallery.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d4d4d8',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* CARD 7: Real-Time Live Preview */}
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      7. Real-Time Storefront Footer Preview
                    </h4>
                    <p style={{ fontSize: '13px', color: '#71717a', margin: '4px 0 0 0' }}>
                      This preview updates live as you type, reflecting the exact design and dark theme rendered for collectors.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveFooterConfig}
                    disabled={isSavingFooter}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e53637',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Settings
                  </button>
                </div>

                <div style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #27272a',
                }}>
                  <div style={{
                    backgroundColor: '#111111',
                    color: '#b7b7b7',
                    padding: '40px 24px 20px',
                    fontFamily: "'Nunito Sans', sans-serif",
                  }}>
                    {/* Top Badges Preview */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '20px',
                      paddingBottom: '24px',
                      marginBottom: '32px',
                      borderBottom: '1px solid #222222',
                    }}>
                      {(footerConfig.feature_badges || []).map((b, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ color: '#e53637' }}>
                            {b.icon === 'shield' ? <ShieldCheck size={26} /> : b.icon === 'refresh' ? <RefreshCw size={26} /> : <Truck size={26} />}
                          </div>
                          <div>
                            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>
                              {b.title || `Badge #${idx + 1}`}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
                              {b.subtitle || 'Badge subtitle description'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

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
                          fontSize: '26px',
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontWeight: 700,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          marginBottom: '8px',
                          lineHeight: 1.15,
                        }}>
                          {footerConfig.brand_name || 'shopbypriya'}
                        </div>

                        {footerConfig.brand_subtitle && (
                          <div style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            color: '#f59e0b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginBottom: '10px',
                          }}>
                            {footerConfig.brand_subtitle}
                          </div>
                        )}

                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#9ca3af', marginBottom: '14px' }}>
                          {footerConfig.brand_description}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: '#d1d5db' }}>
                          {footerConfig.studio_location && (
                            <div>📍 {footerConfig.studio_location}</div>
                          )}
                          {footerConfig.contact_phone && (
                            <div>📞 Concierge: {footerConfig.contact_phone}</div>
                          )}
                          {footerConfig.contact_email && (
                            <div>✉️ Email: {footerConfig.contact_email}</div>
                          )}
                        </div>

                        {footerConfig.show_payment_methods && footerConfig.payment_image_url && (
                          <img
                            src={footerConfig.payment_image_url}
                            alt="Payment methods"
                            style={{ maxHeight: '20px', opacity: 0.8, marginTop: '12px' }}
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        )}
                      </div>

                      {/* Col 2: Categories */}
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '14px' }}>
                          {footerConfig.categories_title}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#888888' }}>
                          {categories.slice(0, footerConfig.max_categories_to_show).map((cat) => (
                            <li key={cat.id}>{cat.name}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Col 3: Custom Links */}
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '14px' }}>
                          {footerConfig.custom_column_title}
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#888888' }}>
                          {(footerConfig.custom_links || []).map((l, idx) => (
                            <li key={idx}>{l.title}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Col 4: Newsletter */}
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', marginBottom: '14px' }}>
                          {footerConfig.newsletter_title}
                        </div>
                        <p style={{ fontSize: '12px', color: '#888888', marginBottom: '12px', lineHeight: 1.5 }}>
                          {footerConfig.newsletter_description}
                        </p>
                        <div style={{ display: 'flex', borderBottom: '1px solid #333333', paddingBottom: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#666666' }}>{footerConfig.newsletter_placeholder}</span>
                          <Mail size={15} color="#e53637" style={{ marginLeft: 'auto' }} />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div style={{
                      borderTop: '1px solid #222222',
                      paddingTop: '16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#666666',
                    }}>
                      {footerConfig.copyright_text}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS */}
          {navSection === 'settings' && (
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              borderRadius: '10px',
              padding: '28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              maxWidth: '600px',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
                Store & Database Settings
              </h3>
              <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
                Current database connection: <strong>PostgreSQL (ArtEcommerce)</strong>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: '#f4f4f5', borderRadius: '6px', fontSize: '13px' }}>
                  <strong>Currency:</strong> Indian Rupee (INR ₹)
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f4f4f5', borderRadius: '6px', fontSize: '13px' }}>
                  <strong>Database URL:</strong> postgresql://postgres:***@localhost:5432/ArtEcommerce
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
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
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
              borderRadius: '12px',
              padding: '28px 32px 30px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '21px', fontWeight: 700, color: '#0f172a', margin: '0 0 5px 0', letterSpacing: '-0.01em' }}>
                {editingPainting ? 'Edit Product' : 'Add Product'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                Add or update inventory details.
              </p>
            </div>

            <form onSubmit={handleSavePainting}>
              {/* Image Upload Area — 3 slots */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px', display: 'block', letterSpacing: '0.01em' }}>
                  Product Images <span style={{ color: '#94a3b8', fontWeight: 400 }}>(max 3)</span>
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
                          border: `1px dashed ${idx === 0 ? '#94a3b8' : '#cbd5e1'}`,
                          borderRadius: '10px',
                          backgroundColor: '#f8fafc',
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
                        <span style={{ fontSize: '11px', fontWeight: 700, color: idx === 0 ? '#475569' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start' }}>{label}</span>
                        {imgVal ? (
                          <>
                            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                              <img
                                src={imgVal}
                                alt={`Product ${idx + 1}`}
                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200'; }}
                              />
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, [slot]: '' })}
                                style={{
                                  position: 'absolute', top: '-6px', right: '-6px',
                                  width: '20px', height: '20px', borderRadius: '50%',
                                  backgroundColor: '#0f172a', color: '#ffffff', border: 'none',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                                }}
                                title="Remove image"
                              >
                                <X size={11} />
                              </button>
                            </div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Upload size={11} /> Replace
                              <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploadingImage}
                                onChange={slot === 'image_url' ? handleImageFileUpload : (e) => handleImageFileUploadSlot(e, slot as 'image_url_2' | 'image_url_3')} />
                            </label>
                          </>
                        ) : (
                          <>
                            <Upload size={22} strokeWidth={1.5} color="#cbd5e1" />
                            <label style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '5px 12px', backgroundColor: '#ffffff',
                              border: '1px solid #d4d4d8', borderRadius: '6px',
                              fontSize: '12px', fontWeight: 600, color: '#0f172a',
                              cursor: uploadingImage ? 'not-allowed' : 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                            }}>
                              <Upload size={11} color="#0f172a" />
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
                <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '7px', display: 'block' }}>
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Audio, Golden Horizon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '7px',
                    padding: '0 14px',
                    fontSize: '14px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                  }}
                  required
                />
              </div>

              {/* Row: Category & Brand Name (matching Image 2) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '7px', display: 'block' }}>
                    Category
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      style={{
                        flex: 1,
                        height: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        padding: '0 12px',
                        fontSize: '14px',
                        color: '#0f172a',
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
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#475569',
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
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: formData.category_id ? 'pointer' : 'default',
                        color: formData.category_id ? '#ef4444' : '#94a3b8',
                      }}
                      title="Delete Selected Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '7px', display: 'block' }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Samsung, Apple, Sony"
                    value={formData.artist_name}
                    onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      padding: '0 14px',
                      fontSize: '14px',
                      color: '#0f172a',
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
                  <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '7px', display: 'block' }}>
                    Store Section
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select
                      value={formData.section_id}
                      onChange={(e) => setFormData({ ...formData, section_id: e.target.value })}
                      style={{
                        flex: 1,
                        height: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        padding: '0 12px',
                        fontSize: '14px',
                        color: '#0f172a',
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
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#475569',
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
                        width: '42px',
                        height: '42px',
                        minWidth: '42px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: formData.section_id ? 'pointer' : 'default',
                        color: formData.section_id ? '#ef4444' : '#94a3b8',
                      }}
                      title="Delete Selected Store Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '7px', display: 'block' }}>
                    Medium / Material
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Oil on Canvas, Acrylic"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      padding: '0 14px',
                      fontSize: '14px',
                      color: '#0f172a',
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
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Regular Pricing
                  </h4>
                  <ChevronDown
                    size={17}
                    color="#64748b"
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
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Price (INR ₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 20000"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          MRP (Actual Price)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 23000 (Struck-out)"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                          Dimensions *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 36 x 48 inches"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '0 12px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe the artwork theme, color harmony, texture, and inspiration..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        style={{
                          width: '100%',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          fontSize: '13.5px',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {/* Inventory & Status Checkboxes */}
                    <div style={{ display: 'flex', gap: '18px', margin: '12px 0', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                        <input
                          type="checkbox"
                          checked={formData.status !== 'inactive'}
                          onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'available' : 'inactive' })}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0b1320' }}
                        />
                        <span>Active (Available in Store)</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500, color: '#475569' }}>
                        <input
                          type="checkbox"
                          checked={formData.is_framed}
                          onChange={(e) => setFormData({ ...formData, is_framed: e.target.checked })}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0b1320' }}
                        />
                        <span>Custom Framing Included</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 500, color: '#475569' }}>
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0b1320' }}
                        />
                        <span>Feature on Hero Slider</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer (Right-aligned Cancel and Update buttons matching Image 2) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '18px',
                  borderTop: '1px solid #f1f5f9',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPaintingModal(false)}
                  style={{
                    padding: '10px 22px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#0b1320',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {editingPainting ? 'Update Product' : 'Add Product'}
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e4e4e7', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  {editingBanner ? 'Edit Hero Banner Content' : 'Create New Hero Banner'}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#71717a', margin: '4px 0 0 0' }}>
                  Update the headline, tag badge, description, image, artist and pricing shown on the hero banner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBanner}>
              {/* Category / Promo Tag */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Category / Promo Tag (Red Uppercase Label) *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ABSTRACT & MODERN CURATION"
                  value={bannerFormData.tag}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, tag: e.target.value })}
                  required
                />
              </div>

              {/* Main Headline Title */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Headline Title *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Symphony in Cobalt & Raw Sienna"
                  value={bannerFormData.title}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description Paragraph */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Description Paragraph *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Bold gestural abstract composition meditating on urban energy and contemplative silence..."
                  value={bannerFormData.description}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                  required
                />
              </div>

              {/* Button Text, Artist, Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Button Text *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="SHOP NOW"
                    value={bannerFormData.button_text}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, button_text: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MARCUS VANCE"
                    value={bannerFormData.artist_name}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, artist_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
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
                    required
                  />
                </div>
              </div>

              {/* Color Configuration (Section Background + Circle Backdrop + Text Color) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px', padding: '14px', backgroundColor: '#fbfbfa', borderRadius: '8px', border: '1px solid #e4e4e7' }}>
                {/* 1. Hero Section Background Color */}
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Section Background Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.bg_color || '#f3f2ee'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px' }}
                      value={bannerFormData.bg_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, bg_color: e.target.value })}
                      placeholder="#f3f2ee"
                    />
                  </div>
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                      { color: '#f3f2ee', name: 'Linen' },
                      { color: '#0073e6', name: 'Cobalt Blue' },
                      { color: '#700b2b', name: 'Deep Wine' },
                      { color: '#1c1917', name: 'Dark Charcoal' },
                      { color: '#ffffff', name: 'Pure White' },
                      { color: '#faf8f5', name: 'Warm Alabaster' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => setBannerFormData({ ...bannerFormData, bg_color: swatch.color })}
                        title={swatch.name}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          backgroundColor: swatch.color,
                          border: bannerFormData.bg_color.toLowerCase() === swatch.color.toLowerCase() ? '2px solid #09090b' : '1px solid #d4d4d8',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 2. Artwork Backdrop Circle Color */}
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Backdrop Circle Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.circle_color || '#eedcd5'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, circle_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px' }}
                      value={bannerFormData.circle_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, circle_color: e.target.value })}
                      placeholder="#eedcd5"
                    />
                  </div>
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                      { color: '#eedcd5', name: 'Blush Sienna' },
                      { color: '#f55600', name: 'Vibrant Amber' },
                      { color: '#e2e7ec', name: 'Cobalt Ice' },
                      { color: '#ece6d8', name: 'Champagne' },
                      { color: '#e5ece9', name: 'Sage Mist' },
                      { color: '#dbeafe', name: 'Soft Sky' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => setBannerFormData({ ...bannerFormData, circle_color: swatch.color })}
                        title={swatch.name}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: swatch.color,
                          border: bannerFormData.circle_color.toLowerCase() === swatch.color.toLowerCase() ? '2px solid #09090b' : '1px solid #d4d4d8',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* 3. Headline & Text Color */}
                <div>
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px', display: 'block' }}>
                    Headline & Text Color *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="color"
                      value={bannerFormData.text_color || '#ffffff'}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, text_color: e.target.value })}
                      style={{ width: '38px', height: '34px', padding: '2px', border: '1px solid #d4d4d8', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ width: '100px', fontSize: '12px' }}
                      value={bannerFormData.text_color}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, text_color: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                  {/* Presets */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {[
                      { color: '#ffffff', name: 'Pure White (For Dark BG)' },
                      { color: '#09090b', name: 'Deep Dark (For Light BG)' },
                      { color: '#fde047', name: 'Bright Gold' },
                      { color: '#f5f5f4', name: 'Warm Alabaster' },
                      { color: '#dbeafe', name: 'Soft Sky' },
                      { color: '#f43f5e', name: 'Rose Red' },
                    ].map((swatch) => (
                      <button
                        key={swatch.color}
                        type="button"
                        onClick={() => setBannerFormData({ ...bannerFormData, text_color: swatch.color })}
                        title={swatch.name}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          backgroundColor: swatch.color,
                          border: (bannerFormData.text_color || '#ffffff').toLowerCase() === swatch.color.toLowerCase() ? '2px solid #09090b' : '1px solid #d4d4d8',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Artwork Image URL and File Upload */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Artwork Image URL or File Upload *
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerFormData.image_url}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, image_url: e.target.value })}
                    required
                  />
                  <label style={{
                    padding: '10px 14px',
                    borderRadius: '4px',
                    border: '1px solid #e4e4e7',
                    backgroundColor: '#f4f4f5',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <Upload size={14} /> {uploadingBannerImage ? 'Uploading...' : 'Browse'}
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
                      style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e4e4e7' }}
                    />
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                      ✓ Image preview loaded
                    </span>
                  </div>
                )}
              </div>

              {/* Order & Active Status */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px', padding: '12px', backgroundColor: '#f4f4f5', borderRadius: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={bannerFormData.is_active}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, is_active: e.target.checked })}
                  />
                  <span style={{ fontWeight: 700, color: bannerFormData.is_active ? '#166534' : '#71717a' }}>
                    Active (Show in Homepage Hero Slider)
                  </span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <label style={{ fontWeight: 600 }}>Display Order:</label>
                  <input
                    type="number"
                    style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #d4d4d8' }}
                    value={bannerFormData.display_order}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e4e4e7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
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
        <div className="modal-overlay" onClick={() => setShowSectionModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <button
              onClick={() => setShowSectionModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              {editingSection ? 'Edit Store Section' : 'Create New Store Section'}
            </h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
              Configure section name and display position. Products assigned to this section will appear in its dedicated section block on the storefront.
            </p>

            <form onSubmit={handleSaveSection}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Section Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Best Sellers, New Arrivals, Hot Sales, Curators Choice"
                  value={sectionFormData.name}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Description (Optional subtitle on storefront)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Brief description of the artworks curated in this section..."
                  value={sectionFormData.description}
                  onChange={(e) => setSectionFormData({ ...sectionFormData, description: e.target.value })}
                />
              </div>

              {/* Section Cover Image with Upload & Live Preview */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Section Cover Image (For Storefront Themes Cards)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  {/* Live Preview Box */}
                  <div style={{
                    width: '80px',
                    height: '60px',
                    minWidth: '80px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    border: '2px solid #e4e4e7',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
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
                      <Layers size={22} color="#94a3b8" />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#f4f4f5',
                        border: '1px solid #d4d4d8',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#09090b',
                      }}>
                        <Upload size={14} />
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
                            padding: '8px 12px',
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '6px',
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
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={sectionFormData.display_order}
                    onChange={(e) => setSectionFormData({ ...sectionFormData, display_order: parseInt(e.target.value) || 1 })}
                    min={1}
                  />
                  <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>
                    1 is displayed first at the top
                  </span>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '16px' }}>
                    <input
                      type="checkbox"
                      checked={sectionFormData.is_active}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, is_active: e.target.checked })}
                    />
                    <span style={{ fontWeight: 700, color: sectionFormData.is_active ? '#166534' : '#71717a' }}>
                      {sectionFormData.is_active ? 'Active (Visible on Store)' : 'Hidden'}
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e4e4e7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
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
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <button
              onClick={() => setShowCategoryModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
              Configure category details and upload a cover thumbnail displayed in the storefront &quot;Shop by Category&quot; circular badges.
            </p>

            <form onSubmit={handleSaveCategory}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="E.g., Oil Painting, Abstract & Modern, Acrylics"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Category Slug (Optional, auto-generated)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. oil-painting (optional)"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                />
              </div>

              {/* Category Cover Image with Live Preview */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Category Cover Image (For Storefront Circle)
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  {/* Live Circle Preview */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    minWidth: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#f1f5f9',
                    border: '2px solid #e4e4e7',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
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
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#94a3b8' }}>
                        {categoryFormData.name ? categoryFormData.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: '#f4f4f5',
                      border: '1px solid #d4d4d8',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#09090b',
                    }}>
                      <Upload size={14} />
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
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Brief description of this artwork category..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e4e4e7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {showTestimonialModal && (
        <div className="modal-overlay" onClick={() => setShowTestimonialModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '8px' }}
          >
            <button
              onClick={() => setShowTestimonialModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#71717a',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              {editingTestimonial ? 'Edit Patron Testimonial' : 'Add New Patron Testimonial'}
            </h3>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '24px' }}>
              Add authentic reviews and patron quotes to feature in the &quot;What Our Patrons Say&quot; showcase.
            </p>

            <form onSubmit={handleSaveTestimonial}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Patron Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Meera Iyer, Rhea Kapoor"
                    value={testimonialFormData.name}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    City / Location
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Chennai, Mumbai"
                    value={testimonialFormData.location}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Rating (Stars)
                  </label>
                  <select
                    className="form-control"
                    value={testimonialFormData.rating}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })}
                    style={{ height: '42px' }}
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Great)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={testimonialFormData.display_order}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, display_order: parseInt(e.target.value) || 1 })}
                    min={1}
                    style={{ height: '42px' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                  Testimonial Quote *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g., The custom silk artwork sat perfectly. The finish and textures were thoroughly taken seriously..."
                  value={testimonialFormData.quote}
                  onChange={(e) => setTestimonialFormData({ ...testimonialFormData, quote: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={testimonialFormData.is_active}
                    onChange={(e) => setTestimonialFormData({ ...testimonialFormData, is_active: e.target.checked })}
                  />
                  <span style={{ fontWeight: 700, color: testimonialFormData.is_active ? '#166534' : '#71717a' }}>
                    {testimonialFormData.is_active ? 'Active (Visible on Storefront)' : 'Hidden'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e4e4e7', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', fontSize: '13px' }}
                >
                  {editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
