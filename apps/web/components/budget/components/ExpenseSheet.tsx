// ─────────────────────────────────────────────────────────────────────────────
// ExpenseSheet — the bottom-sheet add / edit form.
//
// Drives every field of the draft `form` via the controller's setters, computes
// live split amounts as you type, and validates before saving. Rendered as an
// overlay + sheet; the parent decides when it's visible (`showAdd`).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useRef, useState } from 'react';
import type { BudgetController } from '../hooks/useBudget';
import { computeFormSplits } from '../lib/splits';
import { FONT_MONO, mono } from '../styles/ui';
import { segStyle } from '../styles/buttons';
import { CategoryIcon, ChevronDown, Close, Pin, Receipt, Trash } from './icons';

export function ExpenseSheet({ c }: { c: BudgetController }) {
  const { form, participants, categories, currencies, money } = c;

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  const onPickReceipt = () => fileRef.current?.click();

  const onReceiptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!c.uploadReceipt) {
      setUploadErr('Uploads are unavailable right now.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('File is too large (max 10MB).');
      return;
    }
    setUploadErr(null);
    setUploading(true);
    try {
      const url = await c.uploadReceipt(file);
      c.setFormPatch({ receiptUrl: url });
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const vm = useMemo(() => {
    const fAmt = Number(form.amount) || 0;
    const symbolOf = (code: string) => money.symbol(code);

    const formCategories = categories.map((cat) => {
      const active = form.category === cat.id;
      return {
        id: cat.id,
        shortName: cat.short,
        icon: cat.icon,
        iconColor: active ? '#fff' : cat.color,
        bg: active ? cat.color : '#fff',
        fg: active ? '#fff' : '#52564c',
        bd: active ? 'transparent' : '#e6e1d6',
      };
    });

    const payerOptions = participants.map((p) => {
      const active = form.paidBy === p.id;
      return { id: p.id, name: p.name, initials: p.initials, color: p.color, bg: active ? '#eef3e8' : '#fff', bd: active ? '#3a5a40' : '#e6e1d6' };
    });

    const splitterChips = participants.map((p) => {
      const on = form.splitters.includes(p.id);
      return { id: p.id, name: p.name, initials: p.initials, color: p.color, opacity: on ? 1 : 0.3, bg: on ? '#eef3e8' : '#fff', bd: on ? '#3a5a40' : '#e6e1d6' };
    });

    const liveSplits = computeFormSplits(form);
    const splitMap: Record<string, number> = {};
    liveSplits.forEach((s) => (splitMap[s.pid] = s.amount));

    const isPct = form.splitMethod === 'percent';
    const editable = form.splitMethod !== 'equal';
    const splitRows = form.splitters.map((pid) => {
      const p = c.pOf(pid);
      const val = isPct ? form.percents[pid] ?? '' : form.customs[pid] ?? '';
      return {
        pid,
        initials: p.initials,
        color: p.color,
        name: p.name,
        editable,
        unit: isPct ? '%' : symbolOf(form.currency),
        inputVal: String(val),
        amountLabel: money.fmtCur(splitMap[pid] || 0, form.currency),
      };
    });

    const splitSum = liveSplits.reduce((a, s) => a + s.amount, 0);
    const splitDiff = Math.round((fAmt - splitSum) * 100) / 100;
    const splitOk = Math.abs(splitDiff) < 0.02;
    const splitStatusLabel =
      form.splitMethod === 'equal'
        ? 'Split equally'
        : splitOk
        ? 'Fully allocated'
        : splitDiff > 0
        ? money.fmtCur(splitDiff, form.currency) + ' left'
        : money.fmtCur(-splitDiff, form.currency) + ' over';

    const showConvert = fAmt > 0 && form.currency !== money.code;
    const valid = fAmt > 0 && !!form.title.trim() && form.splitters.length > 0;

    return {
      fAmt,
      liveSplits,
      formCategories,
      payerOptions,
      splitterChips,
      splitRows,
      splitSum,
      splitOk,
      splitStatusLabel,
      splitStatusColor: splitOk ? '#3a7a4a' : '#c06a5e',
      splitTotalLabel: money.fmtCur(splitSum, form.currency) + ' / ' + money.fmtCur(fAmt, form.currency),
      showConvert,
      formConvertedLabel: money.fmt(money.toUSD(fAmt, form.currency)),
      formSymbol: symbolOf(form.currency),
      valid,
      saveBg: valid ? '#3a5a40' : '#b8c2b0',
    };
  }, [form, participants, categories, money, c]);

  const segEqual = segStyle(form.splitMethod === 'equal');
  const segPercent = segStyle(form.splitMethod === 'percent');
  const segCustom = segStyle(form.splitMethod === 'custom');

  const labelStyle = mono(9.5, '.12em');

  return (
    <>
      {/* scrim */}
      <div
        onClick={c.closeAdd}
        style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(38,42,34,.45)', backdropFilter: 'blur(3px)', animation: 'budFade .2s ease' }}
      />

      {/* sheet */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81, height: '88%', background: '#f4f1ea', borderRadius: '32px 32px 46px 46px', display: 'flex', flexDirection: 'column', animation: 'budSheetUp .32s cubic-bezier(.22,1,.36,1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px 12px', flexShrink: 0 }}>
          <div style={{ width: 38, height: 5, borderRadius: 3, background: '#d8d2c4', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#2c352c', letterSpacing: '-.01em' }}>
              {c.isEditing ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button onClick={c.closeAdd} style={{ width: 32, height: 32, borderRadius: 11, background: '#e9e4d8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Close />
            </button>
          </div>
        </div>

        <div className="bud-scroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 16px' }}>
          {/* amount + currency */}
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Amount</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e3ddd0', borderRadius: 14, padding: '0 14px', marginTop: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#3a5a40' }}>{vm.formSymbol}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => c.setFormPatch({ amount: e.target.value })}
                  placeholder="0.00"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'none', padding: '13px 8px', fontSize: 18, fontWeight: 800, color: '#2c352c', width: '100%' }}
                />
              </div>
            </div>
            <div style={{ width: 112 }}>
              <label style={labelStyle}>Currency</label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <select
                  value={form.currency}
                  onChange={(e) => c.setFormPatch({ currency: e.target.value })}
                  style={{ appearance: 'none', WebkitAppearance: 'none', width: '100%', background: '#fff', border: '1px solid #e3ddd0', borderRadius: 14, padding: '14px 28px 14px 13px', fontSize: 13, fontWeight: 700, color: '#2c352c', cursor: 'pointer', fontFamily: FONT_MONO }}
                >
                  {currencies.map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.code} {cur.symbol}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
          {vm.showConvert && (
            <div style={{ fontSize: 11, color: '#9a9488', fontWeight: 600, marginTop: 7, paddingLeft: 2 }}>
              ≈ {vm.formConvertedLabel} in {money.code}
            </div>
          )}

          {/* description */}
          <div style={{ marginTop: 15 }}>
            <label style={labelStyle}>Description</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => c.setFormPatch({ title: e.target.value })}
              placeholder="What was it for?"
              style={{ width: '100%', background: '#fff', border: '1px solid #e3ddd0', borderRadius: 14, padding: '13px 14px', marginTop: 6, fontSize: 14, fontWeight: 600, color: '#2c352c', outline: 'none' }}
            />
          </div>

          {/* category */}
          <div style={{ marginTop: 15 }}>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginTop: 7 }}>
              {vm.formCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => c.setFormPatch({ category: cat.id })}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '11px 4px', borderRadius: 13, cursor: 'pointer', transition: 'all .15s', background: cat.bg, color: cat.fg, border: `1px solid ${cat.bd}` }}
                >
                  <CategoryIcon d={cat.icon} size={17} color={cat.iconColor} />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{cat.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* date + location */}
          <div style={{ display: 'flex', gap: 9, marginTop: 15 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => c.setFormPatch({ date: e.target.value })}
                style={{ width: '100%', background: '#fff', border: '1px solid #e3ddd0', borderRadius: 14, padding: '12px 13px', marginTop: 6, fontSize: 13, fontWeight: 600, color: '#2c352c', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Location</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e3ddd0', borderRadius: 14, padding: '0 12px', marginTop: 6 }}>
                <Pin style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => c.setFormPatch({ location: e.target.value })}
                  placeholder="Tag a place"
                  style={{ flex: 1, border: 'none', outline: 'none', background: 'none', padding: '12px 7px', fontSize: 13, fontWeight: 600, color: '#2c352c', width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* who paid */}
          <div style={{ marginTop: 15 }}>
            <label style={labelStyle}>Paid by</label>
            <div style={{ display: 'flex', gap: 7, marginTop: 7 }}>
              {vm.payerOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => c.setFormPatch({ paidBy: p.id })}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 2px', borderRadius: 13, cursor: 'pointer', transition: 'all .15s', color: '#52564c', background: p.bg, border: `1.5px solid ${p.bd}` }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10, background: p.color }}>{p.initials}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* split between + method */}
          <div style={{ marginTop: 18, background: '#fff', border: '1px solid #ece7db', borderRadius: 20, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Split between</label>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3a5a40' }}>{form.splitters.length} people</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {vm.splitterChips.map((p) => (
                <button
                  key={p.id}
                  onClick={() => c.toggleSplitter(p.id)}
                  title={p.name}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 13, cursor: 'pointer', transition: 'all .15s', background: p.bg, border: `1.5px solid ${p.bd}` }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11, background: p.color, opacity: p.opacity }}>{p.initials}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4, marginTop: 14, background: '#eef0e8', padding: 4, borderRadius: 12 }}>
              <button onClick={() => c.setFormPatch({ splitMethod: 'equal' })} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: segEqual.bg, color: segEqual.fg }}>Equal</button>
              <button onClick={() => c.setFormPatch({ splitMethod: 'percent' })} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: segPercent.bg, color: segPercent.fg }}>Percent</button>
              <button onClick={() => c.setFormPatch({ splitMethod: 'custom' })} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: segCustom.bg, color: segCustom.fg }}>Custom</button>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {vm.splitRows.map((r) => (
                <div key={r.pid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 10, flexShrink: 0, background: r.color }}>{r.initials}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#52564c' }}>{r.name}</span>
                  {r.editable && (
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f4f1ea', border: '1px solid #e3ddd0', borderRadius: 10, padding: '0 9px', width: 88 }}>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={r.inputVal}
                        onChange={(e) => (form.splitMethod === 'percent' ? c.setPercentFor(r.pid, e.target.value) : c.setCustomFor(r.pid, e.target.value))}
                        style={{ width: '100%', border: 'none', outline: 'none', background: 'none', padding: '7px 0', fontSize: 13, fontWeight: 700, color: '#2c352c', textAlign: 'right' }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#9a9488', marginLeft: 3 }}>{r.unit}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#2c352c', fontVariantNumeric: 'tabular-nums', width: 74, textAlign: 'right' }}>{r.amountLabel}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 11, borderTop: '1px solid #f0ece2' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#9a9488' }}>{vm.splitStatusLabel}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: vm.splitStatusColor, fontVariantNumeric: 'tabular-nums' }}>{vm.splitTotalLabel}</span>
            </div>
          </div>

          {/* receipt */}
          <div style={{ marginTop: 15 }}>
            <label style={labelStyle}>Receipt</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={onReceiptFile}
              style={{ display: 'none' }}
            />
            {form.receiptUrl ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 12,
                  marginTop: 7,
                  borderRadius: 14,
                  background: '#eef5ea',
                  border: '1.5px solid #9bc09f',
                }}
              >
                <a
                  href={form.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0, textDecoration: 'none', color: '#3a7a4a' }}
                >
                  <Receipt size={18} color="#3a7a4a" />
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>View receipt</span>
                </a>
                <button
                  onClick={() => c.setFormPatch({ receiptUrl: null })}
                  style={{ fontSize: 12, fontWeight: 700, color: '#c06a5e', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={onPickReceipt}
                disabled={uploading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 9,
                  padding: 14,
                  marginTop: 7,
                  borderRadius: 14,
                  cursor: uploading ? 'default' : 'pointer',
                  transition: 'all .15s',
                  background: '#fff',
                  color: '#7a7468',
                  border: '1.5px dashed #d8d2c4',
                  opacity: uploading ? 0.7 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9a9488" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{uploading ? 'Uploading…' : 'Attach a receipt'}</span>
              </button>
            )}
            {uploadErr && (
              <div style={{ fontSize: 11, color: '#c06a5e', fontWeight: 600, marginTop: 6, paddingLeft: 2 }}>{uploadErr}</div>
            )}
          </div>
        </div>

        {/* sticky footer */}
        <div style={{ flexShrink: 0, padding: '14px 22px 26px', background: 'rgba(244,241,234,.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e6e1d6', display: 'flex', gap: 10 }}>
          {c.isEditing && (
            <button onClick={() => c.editingId && c.deleteExpense(c.editingId)} style={{ width: 52, flexShrink: 0, background: '#f7ebe9', border: 'none', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Trash size={18} />
            </button>
          )}
          <button
            onClick={() => c.saveExpense(vm.liveSplits)}
            style={{ flex: 1, background: vm.saveBg, color: '#fff', border: 'none', borderRadius: 15, padding: 15, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 22px -10px rgba(58,90,64,.7)' }}
          >
            {c.isEditing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </div>
    </>
  );
}
