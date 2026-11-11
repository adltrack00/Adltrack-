// Profile photos for every login. Pick or take a photo, then fit it to the circle the way Instagram does: drag to move it,
// pinch (or the slider, or the mouse wheel) to zoom, and Use photo keeps what is inside the circle, 256px across.
import React, { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth";
import { Avatar, Btn, Card } from "./ui";
import { cn } from "../lib/utils";

const MAX_ZOOM = 4;
const OUT = 256;

// The round account button at the top right of each dashboard: your photo, or your initials.
export function MeButton({ onClick, color = "#2b47f0", size = 44, className, testId = "account" }) {
  const { user } = useAuth();
  return (
    <button onClick={onClick} className={cn("shrink-0 rounded-full ring-2 ring-white transition hover:ring-white/70", className)} aria-label="Your account" data-testid={testId}>
      <Avatar name={user ? user.name : ""} photo={user && user.photo} color={color} size={size} />
    </button>
  );
}

// Opens the photo picker, then the cropper. Children get `pick` to start it.
export function usePhotoPicker() {
  const { setPhoto } = useAuth();
  const input = useRef(null);
  const [img, setImg] = useState(null); // { el, url }
  const pick = () => input.current && input.current.click();
  const chosen = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) || file.size > 15000000) { toast.error("Use a JPG, PNG or WebP photo under 15 MB."); return; }
    const url = URL.createObjectURL(file);
    try {
      const el = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      setImg({ el, url });
    } catch (err) { URL.revokeObjectURL(url); toast.error("This photo couldn't be read. Try another."); }
  };
  const close = () => { if (img) URL.revokeObjectURL(img.url); setImg(null); };
  const use = async (dataUrl) => {
    try { await setPhoto(dataUrl); toast.success("Profile photo updated"); close(); } catch (err) { toast.error(err.message); }
  };
  const ui = (
    <>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={chosen} data-testid="photo-input" />
      {img && <PhotoCrop img={img.el} url={img.url} onCancel={close} onUse={use} />}
    </>
  );
  return { pick, ui };
}

// The Settings card: the photo, and buttons to change or remove it.
export function ProfilePhotoCard() {
  const { user, setPhoto } = useAuth();
  const { pick, ui } = usePhotoPicker();
  const remove = async () => { try { await setPhoto(null); toast.success("Photo removed"); } catch (err) { toast.error(err.message); } };
  return (
    <Card className="p-5" data-testid="profile-photo">
      <div className="flex items-center gap-4">
        <button onClick={pick} className="relative shrink-0" aria-label="Change profile photo">
          <Avatar name={user.name} photo={user.photo} size={72} color="#2b47f0" />
          <span className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full bg-neutral-950 text-white ring-2 ring-white"><Camera className="h-3.5 w-3.5" /></span>
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-bold text-neutral-950">Profile photo</div>
          <p className="mt-0.5 text-[13.5px] text-neutral-500">{user.demo ? "In the demo, your photo stays on this device only." : "Shows at the top of your dashboard."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn size="sm" onClick={pick} data-testid="photo-change"><Camera className="h-4 w-4" /> {user.photo ? "Change photo" : "Add photo"}</Btn>
            {user.photo && <Btn size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4" /> Remove</Btn>}
          </div>
        </div>
      </div>
      {ui}
    </Card>
  );
}

function PhotoCrop({ img, url, onCancel, onUse }) {
  const frame = useRef(null);
  const c = useRef(null); // { size, base, zoom, x, y, pts, pinch }
  const [, redraw] = useState(0);
  const [busy, setBusy] = useState(false);

  const fit = () => {
    const s = c.current, sc = s.base * s.zoom, w = img.naturalWidth * sc, h = img.naturalHeight * sc;
    s.x = Math.min(0, Math.max(s.size - w, s.x));
    s.y = Math.min(0, Math.max(s.size - h, s.y));
    redraw((n) => n + 1);
  };
  // Zooming keeps the point under the fingers (or the middle of the circle) where it is.
  const zoom = (z, cx, cy) => {
    const s = c.current, old = s.base * s.zoom;
    if (cx === undefined) { cx = s.size / 2; cy = s.size / 2; }
    s.zoom = Math.min(MAX_ZOOM, Math.max(1, z));
    const nw = s.base * s.zoom;
    s.x = cx - ((cx - s.x) * nw) / old;
    s.y = cy - ((cy - s.y) * nw) / old;
    fit();
  };

  useEffect(() => {
    const size = frame.current.clientWidth;
    const base = size / Math.min(img.naturalWidth, img.naturalHeight);
    c.current = { size, base, zoom: 1, x: (size - img.naturalWidth * base) / 2, y: (size - img.naturalHeight * base) / 2, pts: new Map(), pinch: null };
    fit();
    const el = frame.current;
    const wheel = (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); zoom(c.current.zoom * Math.exp(-e.deltaY / 400), e.clientX - r.left, e.clientY - r.top); };
    el.addEventListener("wheel", wheel, { passive: false });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { el.removeEventListener("wheel", wheel); document.body.style.overflow = prev; };
  }, [img]); // eslint-disable-line react-hooks/exhaustive-deps

  const at = (e) => { const r = frame.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const down = (e) => { frame.current.setPointerCapture(e.pointerId); c.current.pts.set(e.pointerId, at(e)); c.current.pinch = null; };
  const move = (e) => {
    const s = c.current;
    if (!s || !s.pts.has(e.pointerId)) return;
    const [px, py] = s.pts.get(e.pointerId), p = at(e);
    s.pts.set(e.pointerId, p);
    if (s.pts.size === 1) { s.x += p[0] - px; s.y += p[1] - py; fit(); return; }
    const [a, b] = [...s.pts.values()], dist = Math.hypot(a[0] - b[0], a[1] - b[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (s.pinch) { s.x += mid[0] - s.pinch.mid[0]; s.y += mid[1] - s.pinch.mid[1]; zoom((s.zoom * dist) / s.pinch.dist, mid[0], mid[1]); }
    s.pinch = { dist, mid };
  };
  const up = (e) => { if (!c.current) return; c.current.pts.delete(e.pointerId); c.current.pinch = null; };

  const use = async () => {
    const s = c.current, sc = s.base * s.zoom, out = document.createElement("canvas");
    out.width = out.height = OUT;
    out.getContext("2d").drawImage(img, -s.x / sc, -s.y / sc, s.size / sc, s.size / sc, 0, 0, OUT, OUT);
    setBusy(true);
    await onUse(out.toDataURL("image/jpeg", 0.85));
    setBusy(false);
  };

  const s = c.current;
  const sc = s ? s.base * s.zoom : 0;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[radial-gradient(120%_80%_at_50%_0%,#141a5c_0%,#0a0d2e_55%,#05061a_100%)] text-white" role="dialog" aria-label="Move and scale your photo" data-testid="photo-crop">
      <div className="relative z-10 flex items-center justify-between px-4 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
        <button onClick={onCancel} className="rounded-full px-3 py-2 text-[15px] font-medium text-white/75 hover:text-white">Cancel</button>
        <h2 className="text-[17px] font-bold tracking-tight">Move and scale</h2>
        <button onClick={use} disabled={busy} className="rounded-full bg-white px-4 py-2 text-[15px] font-bold text-neutral-950 disabled:opacity-60" data-testid="photo-use">{busy ? "Saving…" : "Use photo"}</button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-hidden px-8">
        <div ref={frame} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          className="relative aspect-square w-full max-w-[min(420px,60vh)] cursor-grab touch-none select-none active:cursor-grabbing" data-testid="photo-frame">
          <img src={url} alt="" draggable={false} className="pointer-events-none absolute left-0 top-0 max-w-none"
            style={s ? { width: img.naturalWidth * sc, height: img.naturalHeight * sc, transform: `translate(${s.x}px, ${s.y}px)` } : { opacity: 0 }} />
          {/* Dim everything outside the circle, Instagram style. */}
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(5,6,26,0.62)] ring-2 ring-white/80" />
        </div>
      </div>
      <label className="relative mx-auto mb-2 flex w-full max-w-sm items-center gap-3 px-8 text-[20px] text-white/70">
        <span aria-hidden>−</span>
        <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={s ? s.zoom : 1} onChange={(e) => zoom(Number(e.target.value))} aria-label="Zoom" className="flex-1 accent-white" data-testid="photo-zoom" />
        <span aria-hidden>+</span>
      </label>
      <p className="relative pb-[max(24px,env(safe-area-inset-bottom))] text-center text-[13px] text-white/45">Drag to move · pinch or slide to zoom</p>
    </div>
  );
}
