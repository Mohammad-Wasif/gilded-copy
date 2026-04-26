import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import type { AdminCategory, AdminCategoryInput } from '../../lib/types';

type FilterMode = 'all' | 'active' | 'inactive' | 'root' | 'subcategories';
type EditorMode = 'create' | 'edit';
type ImageField = 'thumbnailImageUrl' | 'bannerImageUrl';

interface CategoryFormState {
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  thumbnailImageUrl: string;
  bannerImageUrl: string;
  status: AdminCategoryInput['status'];
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
}

interface FlatCategoryRow {
  category: AdminCategory;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

const emptyForm: CategoryFormState = {
  name: '',
  slug: '',
  parentId: null,
  description: '',
  thumbnailImageUrl: '',
  bannerImageUrl: '',
  status: 'ACTIVE',
  sortOrder: '',
  seoTitle: '',
  seoDescription: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function flattenTree(
  categories: AdminCategory[],
  expandedIds: Set<string>,
  depth = 0
): FlatCategoryRow[] {
  return categories.flatMap((category) => {
    const isExpanded = expandedIds.has(category.id);
    const row: FlatCategoryRow = {
      category,
      depth,
      isExpanded,
      hasChildren: category.children.length > 0,
    };

    if (!isExpanded || category.children.length === 0) {
      return [row];
    }

    return [row, ...flattenTree(category.children, expandedIds, depth + 1)];
  });
}

function flattenAllCategories(categories: AdminCategory[], depth = 0): Array<{ category: AdminCategory; depth: number }> {
  return categories.flatMap((category) => [
    { category, depth },
    ...flattenAllCategories(category.children, depth + 1),
  ]);
}

function findCategoryById(categories: AdminCategory[], id: string | null): AdminCategory | null {
  if (!id) {
    return null;
  }

  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    const childMatch = findCategoryById(category.children, id);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

function collectAllIds(categories: AdminCategory[]): string[] {
  return categories.flatMap((category) => [category.id, ...collectAllIds(category.children)]);
}

function collectDescendantIds(category: AdminCategory): string[] {
  return category.children.flatMap((child) => [child.id, ...collectDescendantIds(child)]);
}

function filterTree(categories: AdminCategory[], search: string, filterMode: FilterMode): AdminCategory[] {
  const normalizedSearch = search.trim().toLowerCase();

  return categories
    .map((category) => {
      const children = filterTree(category.children, search, filterMode);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.slug.toLowerCase().includes(normalizedSearch) ||
        (category.description ?? '').toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filterMode === 'all' ||
        (filterMode === 'active' && category.status === 'ACTIVE') ||
        (filterMode === 'inactive' && category.status === 'INACTIVE') ||
        (filterMode === 'root' && category.parentId === null) ||
        (filterMode === 'subcategories' && category.parentId !== null);

      if ((matchesSearch && matchesFilter) || children.length > 0) {
        return {
          ...category,
          children,
        };
      }

      return null;
    })
    .filter((category): category is AdminCategory => category !== null);
}

function getSiblingOrder(categories: AdminCategory[], parentId: string | null): string[] {
  const siblings = parentId === null
    ? categories
    : findCategoryById(categories, parentId)?.children ?? [];

  return siblings.map((category) => category.id);
}

function buildFormState(category?: AdminCategory | null, parentId?: string | null): CategoryFormState {
  if (!category) {
    return {
      ...emptyForm,
      parentId: parentId ?? null,
    };
  }

  return {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId,
    description: category.description ?? '',
    thumbnailImageUrl: category.thumbnailImageUrl ?? category.primaryImageUrl ?? '',
    bannerImageUrl: category.bannerImageUrl ?? '',
    status: category.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    sortOrder: String(category.sortOrder),
    seoTitle: category.seoTitle ?? '',
    seoDescription: category.seoDescription ?? '',
  };
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getCategoryTree();
      setCategories(response.data);
      setExpandedIds((current) => (current.size > 0 ? current : new Set(collectAllIds(response.data))));
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredTree = useMemo(
    () => filterTree(categories, search, filterMode),
    [categories, search, filterMode]
  );

  const visibleRows = useMemo(
    () => flattenTree(filteredTree, expandedIds),
    [filteredTree, expandedIds]
  );

  const allCategoryOptions = useMemo(
    () => flattenAllCategories(categories),
    [categories]
  );

  const editingCategory = useMemo(
    () => findCategoryById(categories, editingCategoryId),
    [categories, editingCategoryId]
  );

  const editorTitle = editorMode === 'edit' ? 'Edit Category' : 'Create Category';
  const totalCategories = useMemo(() => collectAllIds(categories).length, [categories]);
  const activeCategories = useMemo(
    () => flattenAllCategories(categories).filter(({ category }) => category.status === 'ACTIVE').length,
    [categories]
  );

  function openCreateEditor(parentId: string | null = null) {
    setEditorMode('create');
    setEditingCategoryId(null);
    setAutoSlug(true);
    setForm(buildFormState(null, parentId));
    setNotice(null);
    setError(null);
  }

  function openEditEditor(category: AdminCategory) {
    setEditorMode('edit');
    setEditingCategoryId(category.id);
    setAutoSlug(false);
    setForm(buildFormState(category));
    setNotice(null);
    setError(null);
  }

  function toggleExpanded(categoryId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function handleFormChange<K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'name' && autoSlug) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const thumbnail = form.thumbnailImageUrl.trim() || null;
    const banner = form.bannerImageUrl.trim() || null;

    const payload: AdminCategoryInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      parentId: form.parentId,
      description: form.description.trim() || null,
      thumbnailImageUrl: thumbnail,
      bannerImageUrl: banner,
      // Logic: Use thumbnail for primary display, fallback to banner if thumbnail is missing
      primaryImageUrl: thumbnail || banner,
      status: form.status,
      sortOrder: form.sortOrder.trim() === '' ? null : Number(form.sortOrder),
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
    };

    try {
      if (editorMode === 'edit' && editingCategoryId) {
        await api.admin.updateCategory(editingCategoryId, payload);
        setNotice('Category updated successfully.');
      } else {
        await api.admin.createCategory(payload);
        setNotice('Category created successfully.');
      }

      await loadCategories();
      if (editorMode === 'create') {
        openCreateEditor(form.parentId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Delete "${category.name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setNotice(null);
      await api.admin.deleteCategory(category.id);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(category.id);
        return next;
      });
      if (editingCategoryId === category.id) {
        openCreateEditor(category.parentId);
      }
      setNotice('Category deleted.');
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  }

  async function handleHardDelete(category: AdminCategory) {
    const confirmed = window.confirm(
      `⚠️ PERMANENTLY DELETE "${category.name}"?\n\nThis will:\n• Remove the category from the database forever\n• Move any archived products to the parent category\n\nRequirements:\n• Category must NOT be active\n• Category must NOT be a root category\n• All associated products must be archived\n\nThis action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setNotice(null);
      await api.admin.hardDeleteCategory(category.id);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(category.id);
        return next;
      });
      if (editingCategoryId === category.id) {
        openCreateEditor(category.parentId);
      }
      setNotice(`Category "${category.name}" permanently deleted.`);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to hard-delete category');
    }
  }

  async function handleStatusToggle(category: AdminCategory) {
    const nextStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setError(null);
      setNotice(null);
      await api.admin.updateCategoryStatus(category.id, nextStatus);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  }

  async function handleBulkAction(action: 'activate' | 'deactivate' | 'delete') {
    if (selectedIds.size === 0) {
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm(`Delete ${selectedIds.size} selected categories where allowed?`);
      if (!confirmed) {
        return;
      }
    }

    try {
      setError(null);
      setNotice(null);
      const response = await api.admin.bulkUpdateCategories(Array.from(selectedIds), action);
      const { updatedIds, errors } = response.data;

      if (errors.length > 0) {
        setError(errors.join(' | '));
      }

      if (updatedIds.length > 0) {
        setNotice(`${updatedIds.length} categories updated.`);
      }

      setSelectedIds(new Set());
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Bulk action failed');
    }
  }

  async function handleImageUpload(field: ImageField, file: File | null) {
    if (!file) {
      return;
    }

    try {
      setUploadingField(field);
      setError(null);
      const response = await api.upload.media(file);
      const secureUrl = response.data.secure_url as string;
      handleFormChange(field, secureUrl);
      setNotice(field === 'thumbnailImageUrl' ? 'Thumbnail uploaded. Remember to click "Save Category" to persist changes.' : 'Banner uploaded. Remember to click "Save Category" to persist changes.');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingField(null);
    }
  }

  async function handleDrop(targetCategoryId: string) {
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      return;
    }

    const source = findCategoryById(categories, draggedCategoryId);
    const target = findCategoryById(categories, targetCategoryId);

    if (!source || !target || source.parentId !== target.parentId) {
      setError('You can only reorder categories within the same parent level.');
      setDraggedCategoryId(null);
      return;
    }

    const siblingIds = getSiblingOrder(categories, source.parentId);
    const sourceIndex = siblingIds.indexOf(source.id);
    const targetIndex = siblingIds.indexOf(target.id);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggedCategoryId(null);
      return;
    }

    const reorderedIds = [...siblingIds];
    reorderedIds.splice(sourceIndex, 1);
    reorderedIds.splice(targetIndex, 0, source.id);

    try {
      setError(null);
      await api.admin.reorderCategories(source.parentId, reorderedIds);
      setNotice('Category order updated.');
      await loadCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to reorder categories');
    } finally {
      setDraggedCategoryId(null);
    }
  }

  const blockedParentIds = useMemo(() => {
    if (!editingCategory) {
      return new Set<string>();
    }

    return new Set([editingCategory.id, ...collectDescendantIds(editingCategory)]);
  }, [editingCategory]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-[28px] border border-primary/10 bg-[linear-gradient(135deg,#fffdf8_0%,#f6efe4_48%,#efe5d2_100%)] p-8 shadow-[0_24px_60px_-30px_rgba(87,0,19,0.35)]">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-tertiary-fixed/35 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">Admin Taxonomy Desk</p>
            <h2 className="text-2xl md:text-4xl text-primary">Dynamic Category Manager</h2>
            <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">
              Add nested categories, drag siblings into order, toggle visibility, and manage search metadata from one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Total</p>
              <p className="mt-2 text-2xl font-headline text-primary">{totalCategories}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Active</p>
              <p className="mt-2 text-2xl font-headline text-secondary">{activeCategories}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Hidden</p>
              <p className="mt-2 text-2xl font-headline text-tertiary">{Math.max(0, totalCategories - activeCategories)}</p>
            </div>
            <button
              type="button"
              onClick={() => openCreateEditor(null)}
              className="rounded-2xl bg-primary px-4 py-4 text-left text-on-primary transition hover:opacity-90"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/75">Quick Action</p>
              <p className="mt-2 text-base font-semibold">Add Category</p>
            </button>
          </div>
        </div>
      </div>

      {(error || notice) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-error/25 bg-error-container/70 px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-2xl border border-secondary/20 bg-secondary-container/50 px-4 py-3 text-sm text-on-surface">
              {notice}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.95fr)]">
        <section className="min-w-0 rounded-[28px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_20px_50px_-30px_rgba(26,28,26,0.22)]">
          <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                  search
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search categories, slugs, or descriptions..."
                  className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-10 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  ['all', 'All'],
                  ['active', 'Active'],
                  ['inactive', 'Inactive'],
                  ['root', 'Root Categories'],
                  ['subcategories', 'Subcategories'],
                ] as Array<[FilterMode, string]>).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterMode(value)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                      filterMode === value
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedIds(new Set(collectAllIds(categories)))}
                  className="rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:border-primary hover:text-primary"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedIds(new Set())}
                  className="rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:border-primary hover:text-primary"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={() => openCreateEditor(null)}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-primary transition hover:opacity-90"
                >
                  Add Category
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => handleBulkAction('activate')}
                  className="rounded-xl bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Activate Selected
                </button>
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => handleBulkAction('deactivate')}
                  className="rounded-xl bg-tertiary px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Deactivate Selected
                </button>
                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={() => handleBulkAction('delete')}
                  className="rounded-xl bg-error px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-outline-variant/15 bg-surface">
            <div className="overflow-x-auto">
              <div className="min-w-[850px]">
            <div className="grid grid-cols-[2rem_minmax(0,1.9fr)_7rem_7rem_14rem] gap-3 border-b border-outline-variant/15 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
              <div>
                <input
                  type="checkbox"
                  aria-label="Select all categories"
                  checked={visibleRows.length > 0 && visibleRows.every((row) => selectedIds.has(row.category.id))}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setSelectedIds((current) => {
                      const next = new Set(current);
                      visibleRows.forEach((row) => {
                        if (checked) {
                          next.add(row.category.id);
                        } else {
                          next.delete(row.category.id);
                        }
                      });
                      return next;
                    });
                  }}
                  className="h-4 w-4 rounded border-outline-variant/40"
                />
              </div>
              <div>Category</div>
              <div>Products</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="max-h-[68vh] overflow-auto">
              {loading ? (
                <div className="space-y-3 p-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-surface-container-low" />
                  ))}
                </div>
              ) : visibleRows.length === 0 ? (
                <div className="px-6 py-20 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined mb-3 block text-4xl opacity-50">folder_off</span>
                  <p className="text-sm">No categories match the current search or filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {visibleRows.map(({ category, depth, hasChildren, isExpanded }) => (
                    <div
                      key={category.id}
                      draggable
                      onDragStart={() => setDraggedCategoryId(category.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(category.id)}
                      className={`grid grid-cols-[2rem_minmax(0,1.9fr)_7rem_7rem_14rem] gap-3 px-5 py-4 transition ${
                        draggedCategoryId === category.id ? 'bg-primary/6' : 'hover:bg-surface-container-low/70'
                      }`}
                    >
                      <div className="pt-2">
                        <input
                          type="checkbox"
                          aria-label={`Select ${category.name}`}
                          checked={selectedIds.has(category.id)}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setSelectedIds((current) => {
                              const next = new Set(current);
                              if (checked) {
                                next.add(category.id);
                              } else {
                                next.delete(category.id);
                              }
                              return next;
                            });
                          }}
                          className="h-4 w-4 rounded border-outline-variant/40"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start gap-3" style={{ paddingLeft: `${depth * 22}px` }}>
                          <div className="flex items-center gap-2 pt-1">
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(category.id)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container-low text-primary transition hover:bg-primary hover:text-on-primary"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? 'expand_more' : 'chevron_right'}
                                </span>
                              </button>
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center text-outline">
                                <span className="material-symbols-outlined text-[16px]">drag_indicator</span>
                              </span>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 items-start gap-3">
                            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-low">
                              {category.thumbnailImageUrl || category.primaryImageUrl ? (
                                <img
                                  src={category.thumbnailImageUrl || category.primaryImageUrl || ''}
                                  alt={category.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-on-surface-variant/45">category</span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditEditor(category)}
                                  className="truncate text-left text-base font-semibold text-primary transition hover:opacity-80"
                                >
                                  {category.name}
                                </button>
                                <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs text-on-surface-variant">
                                  {category.productCount}
                                </span>
                                {category.parentId === null && (
                                  <span className="rounded-full bg-tertiary-fixed/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">
                                    Root
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-on-surface-variant">{category.slug}</p>
                              <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
                                {category.description || 'No description added yet.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm font-semibold text-on-surface">
                        {category.productCount}
                      </div>

                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(category)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
                            category.status === 'ACTIVE' ? 'bg-secondary' : 'bg-outline/45'
                          }`}
                          aria-label={`Toggle ${category.name} visibility`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                              category.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCreateEditor(category.id)}
                          className="rounded-xl bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary hover:text-on-primary"
                        >
                          + Subcategory
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditEditor(category)}
                          className="rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition hover:border-primary hover:text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          className="rounded-xl border border-error/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-error transition hover:bg-error hover:text-white"
                        >
                          Delete
                        </button>
                        {category.parentId !== null && category.status !== 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleHardDelete(category)}
                            className="rounded-xl bg-error px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-80"
                            title="Permanently delete — requires all products archived, category inactive, and non-root"
                          >
                            Hard Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-[0_20px_50px_-30px_rgba(26,28,26,0.22)]">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/70">Category Details</p>
              <h3 className="mt-2 text-2xl text-primary">{editorTitle}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Manage structure, metadata, images, visibility, and search presentation from this panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateEditor(null)}
              className="rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              New
            </button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                  required
                  className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Gold Zari"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">URL Slug</span>
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setAutoSlug(false);
                    handleFormChange('slug', slugify(event.target.value));
                  }}
                  required
                  className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="gold-zari"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={autoSlug}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setAutoSlug(checked);
                  if (checked) {
                    handleFormChange('slug', slugify(form.name));
                  }
                }}
                className="h-4 w-4 rounded border-outline-variant/40"
              />
              Auto-generate slug from the name
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Parent Category</span>
                <select
                  value={form.parentId ?? ''}
                  onChange={(event) => handleFormChange('parentId', event.target.value || null)}
                  className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">None (root category)</option>
                  {allCategoryOptions
                    .filter(({ category }) => !blockedParentIds.has(category.id))
                    .map(({ category, depth }) => (
                      <option key={category.id} value={category.id}>
                        {'— '.repeat(depth)}{category.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Sort Order</span>
                <input
                  value={form.sortOrder}
                  onChange={(event) => handleFormChange('sortOrder', event.target.value)}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="2"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => handleFormChange('description', event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Premium metallic threads for couture embroidery and ceremonial textiles."
              />
            </label>

            <div className="rounded-[24px] border border-outline-variant/15 bg-surface p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">Visibility</p>
                  <p className="text-xs text-on-surface-variant">Use the toggle to hide a category without deleting it.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFormChange('status', form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    form.status === 'ACTIVE' ? 'bg-secondary' : 'bg-outline/45'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      form.status === 'ACTIVE' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                {form.status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="space-y-4 rounded-[24px] border border-outline-variant/15 bg-surface p-4">
              <div>
                <p className="text-sm font-semibold text-primary">Images</p>
                <p className="text-xs text-on-surface-variant">Upload a thumbnail and an optional banner image for hero sections.</p>
              </div>

              {([
                ['thumbnailImageUrl', 'Thumbnail Image'],
                ['bannerImageUrl', 'Banner Image'],
              ] as Array<[ImageField, string]>).map(([field, label]) => (
                <div key={field} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{label}</span>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition hover:border-primary">
                        {uploadingField === field ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            handleImageUpload(field, file);
                            // Reset input value so the same file can be uploaded again if needed
                            event.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      {form[field] && (
                        <button
                          type="button"
                          onClick={() => handleFormChange(field, '')}
                          className="rounded-xl border border-error/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-error transition hover:bg-error/5"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    value={form[field]}
                    onChange={(event) => handleFormChange(field, event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant/25 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="https://..."
                  />
                  {form[field] && (
                    <div className="group relative overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-low">
                      <img 
                        key={form[field]} 
                        src={form[field]} 
                        alt={label} 
                        className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleFormChange(field, '')}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-error shadow-lg transition hover:bg-white hover:scale-110"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-[24px] border border-outline-variant/15 bg-surface p-4">
              <div>
                <p className="text-sm font-semibold text-primary">SEO</p>
                <p className="text-xs text-on-surface-variant">Control how this category appears in search results and social previews.</p>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">SEO Title</span>
                <input
                  value={form.seoTitle}
                  onChange={(event) => handleFormChange('seoTitle', event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant/25 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Gold Zari Threads for Embroidery"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Meta Description</span>
                <textarea
                  value={form.seoDescription}
                  onChange={(event) => handleFormChange('seoDescription', event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-outline-variant/25 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Premium gold zari threads for bridal and couture embroidery."
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={saving || uploadingField !== null}
                className="flex-1 rounded-2xl bg-primary px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : uploadingField ? 'Uploading...' : 'Save Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editorMode === 'edit' && editingCategory) {
                    setForm(buildFormState(editingCategory));
                  } else {
                    openCreateEditor(null);
                  }
                }}
                className="rounded-2xl border border-outline-variant/20 px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant transition hover:border-primary hover:text-primary"
              >
                Reset
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
