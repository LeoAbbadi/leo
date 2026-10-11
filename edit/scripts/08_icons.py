"""Small SVG icon library (viewBox 0 0 100 100) for the Liquid Glass compositions."""
CY, BL, DK, GR, RD = "#00E5FF", "#2F7CFF", "#1D1D1F", "#34C759", "#FF3B30"

def svg(body, size=100, extra=""):
    return f'<svg viewBox="0 0 100 100" width="{size}" height="{size}" {extra}>{body}</svg>'

I = {
 "in": f'<circle cx="50" cy="50" r="46" fill="rgba(0,229,255,0.16)"/><path d="M26 62v12h48V62" fill="none" stroke="{BL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 22v38M36 46l14 14 14-14" fill="none" stroke="{CY}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
 "out": f'<circle cx="50" cy="50" r="46" fill="rgba(255,59,48,0.12)"/><path d="M26 62v12h48V62" fill="none" stroke="{BL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 60V22M36 36l14-14 14 14" fill="none" stroke="{RD}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',
 "plane": f'<path d="M50 8c4 0 6 6 6 12v20l32 18v9l-32-9v19l9 7v7l-15-4-15 4v-7l9-7V58l-32 9v-9l32-18V20c0-6 2-12 6-12z" fill="{BL}"/>',
 "clock": f'<circle cx="50" cy="50" r="40" fill="#fff" stroke="{BL}" stroke-width="7"/><path d="M50 26v26l16 10" fill="none" stroke="{DK}" stroke-width="7" stroke-linecap="round"/>',
 "cupcake": '<path d="M24 52h52l-8 38H32z" fill="#7FD8FF"/><path d="M30 52l4 38M40 52l2 38M50 52v38M60 52l-2 38M70 52l-4 38" stroke="#fff" stroke-width="2.5" opacity=".7"/><path d="M20 54c-4-16 10-22 16-20 2-12 26-14 30-2 10-4 20 6 14 22z" fill="#FF9EC0"/><circle cx="52" cy="22" r="7" fill="#FF3B30"/>',
 "chips": '<path d="M28 14h44l-4 10 6 62H26l6-62z" fill="#FF9F0A"/><path d="M30 44c10-8 30-8 40 0v18c-10 8-30 8-40 0z" fill="#FFD60A"/><path d="M28 14l4 10h36l4-10" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>',
 "brownie": '<rect x="12" y="30" width="76" height="52" rx="10" fill="#6B3E26"/><rect x="12" y="30" width="76" height="20" rx="10" fill="#8A5634"/><path d="M18 44c8 6 12-4 20 2s12-6 20 0 12-4 22 2" fill="none" stroke="#C99369" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="64" r="3" fill="#C99369"/><circle cx="58" cy="70" r="3" fill="#C99369"/><circle cx="72" cy="60" r="3" fill="#C99369"/>',
 "book": f'<path d="M14 24h30c4 0 6 3 6 6v54c0-3-2-6-6-6H14z" fill="{CY}"/><path d="M86 24H56c-4 0-6 3-6 6v54c0-3 2-6 6-6h30z" fill="{BL}"/>',
 "store": f'<rect x="18" y="44" width="64" height="42" rx="4" fill="#fff" stroke="{BL}" stroke-width="5"/><path d="M12 26h76l-4 18H16z" fill="{CY}"/><path d="M24 26l-3 18M37 26l-1 18M50 26v18M63 26l1 18M76 26l3 18" stroke="#fff" stroke-width="6"/><rect x="28" y="56" width="18" height="30" rx="2" fill="{BL}"/><rect x="54" y="56" width="20" height="14" rx="2" fill="rgba(0,229,255,.35)"/>',
 "coffee": f'<path d="M22 44h48v18c0 14-10 24-24 24S22 76 22 62z" fill="#fff" stroke="{BL}" stroke-width="5"/><path d="M70 50h6c6 0 8 4 8 8s-2 8-8 8h-7" fill="none" stroke="{BL}" stroke-width="5"/><ellipse cx="46" cy="90" rx="34" ry="5" fill="{CY}" opacity=".6"/><g id="STEAM"><path d="M36 36c-6-8 6-12 0-22M50 36c-6-8 6-12 0-22M64 36c-6-8 6-12 0-22" fill="none" stroke="#9CC9FF" stroke-width="4" stroke-linecap="round"/></g>',
 "box": f'<rect x="12" y="34" width="76" height="50" rx="12" fill="#fff" stroke="{BL}" stroke-width="5"/><rect x="8" y="26" width="84" height="12" rx="6" fill="{CY}"/><g id="FOOD"><ellipse cx="34" cy="58" rx="14" ry="10" fill="#F2F2F2" stroke="#D9D9D9"/><path d="M52 64c4-16 18-18 24-12-4 10-14 16-24 12z" fill="#34C759"/><rect x="40" y="66" width="22" height="8" rx="4" fill="#FF9F0A"/></g>',
 "trash": f'<path d="M24 34h52l-5 54H29z" fill="#fff" stroke="{BL}" stroke-width="5"/><rect x="18" y="24" width="64" height="10" rx="5" fill="{BL}"/><rect x="40" y="16" width="20" height="8" rx="4" fill="{BL}"/><path d="M40 46v32M50 46v32M60 46v32" stroke="{CY}" stroke-width="4" stroke-linecap="round"/>',
 "wallet": f'<rect x="10" y="26" width="80" height="58" rx="12" fill="{BL}"/><path d="M14 30l50-16 6 12" fill="{CY}"/><rect x="58" y="46" width="32" height="20" rx="8" fill="#fff"/><circle cx="68" cy="56" r="4" fill="{BL}"/>',
 "kebab": '<path d="M30 20l40 0-8 66H38z" fill="#F4D7A0"/><path d="M34 32h32M33 44h34M35 56h30M36 68h28" stroke="#C0784A" stroke-width="7" stroke-linecap="round"/><path d="M36 28c6 6 22 6 28 0M36 50c6 6 22 6 28 0" stroke="#34C759" stroke-width="4" fill="none"/><rect x="47" y="8" width="6" height="88" rx="3" fill="#8E8E93"/>',
 "burger": '<path d="M14 46c0-20 72-20 72 0z" fill="#F2A33A"/><rect x="12" y="50" width="76" height="8" rx="4" fill="#34C759"/><rect x="12" y="58" width="76" height="12" rx="6" fill="#7A3E1D"/><path d="M14 58l10 8 10-8 10 8 10-8 10 8 10-8 10 8" fill="#FFD60A"/><path d="M14 72h72c0 10-8 14-14 14H28c-6 0-14-4-14-14z" fill="#F2A33A"/><circle cx="36" cy="34" r="2" fill="#fff"/><circle cx="52" cy="30" r="2" fill="#fff"/><circle cx="64" cy="36" r="2" fill="#fff"/>',
 "house": f'<path d="M14 48L50 18l36 30" fill="none" stroke="{BL}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 44v40h52V44" fill="#fff" stroke="{BL}" stroke-width="6"/><rect x="42" y="60" width="16" height="24" rx="2" fill="{CY}"/>',
 "broom": f'<path d="M66 10L44 54" stroke="#8E8E93" stroke-width="6" stroke-linecap="round"/><path d="M38 50l18 10-8 30c-10 0-26-8-30-16z" fill="{CY}"/><path d="M30 78l12-12M36 84l12-14M24 72l12-10" stroke="#fff" stroke-width="3"/>',
 "fork": f'<path d="M30 12v28c0 6 4 10 8 10v38M22 12v22M38 12v22" fill="none" stroke="{BL}" stroke-width="6" stroke-linecap="round"/><path d="M66 12c-10 6-12 24-12 36h12v40" fill="none" stroke="{CY}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
 "bag": f'<path d="M18 34h64l-6 54H24z" fill="{CY}"/><path d="M36 40V28c0-8 6-14 14-14s14 6 14 14v12" fill="none" stroke="{BL}" stroke-width="6" stroke-linecap="round"/>',
 "bag2": f'<path d="M22 38h56l-4 50H26z" fill="#fff" stroke="{BL}" stroke-width="5"/><path d="M38 42V30c0-7 5-12 12-12s12 5 12 12v12" fill="none" stroke="{BL}" stroke-width="5" stroke-linecap="round"/>',
 "shirt": f'<path d="M30 14l-20 14 10 16 10-6v48h40V38l10 6 10-16-20-14c-4 8-10 10-20 10s-16-2-20-10z" fill="{BL}"/>',
 "pin": f'<path d="M50 92S20 58 20 38a30 30 0 0160 0c0 20-30 54-30 54z" fill="{CY}"/><circle cx="50" cy="38" r="11" fill="#fff"/>',
 "trophy": f'<path d="M30 14h40v20c0 14-8 24-20 24S30 48 30 34z" fill="{CY}"/><path d="M30 20H16c0 14 6 20 16 20M70 20h14c0 14-6 20-16 20" fill="none" stroke="{BL}" stroke-width="5"/><rect x="44" y="58" width="12" height="14" fill="{BL}"/><rect x="30" y="72" width="40" height="12" rx="4" fill="{BL}"/>',
 "check": f'<circle cx="50" cy="50" r="46" fill="{GR}"/><path d="M28 52l15 15 30-32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
 "coin": '<circle cx="50" cy="50" r="44" fill="#FFD60A" stroke="#F2B705" stroke-width="6"/><text x="50" y="66" font-family="Poppins" font-weight="700" font-size="46" text-anchor="middle" fill="#B98400">€</text>',
 "cal": f'<rect x="12" y="18" width="76" height="70" rx="12" fill="#fff" stroke="{BL}" stroke-width="5"/><rect x="12" y="18" width="76" height="20" rx="10" fill="{BL}"/><path d="M32 10v16M68 10v16" stroke="{DK}" stroke-width="6" stroke-linecap="round"/>',
}
def icon(name, size=100, extra=""):
    return svg(I[name], size, extra)

def can(label, body, stripe, text="#fff", w=150, h=260, fs=22):
    """generic can; fs = label size in viewBox units (rendered size = fs * w / 150, kept >= 30 px); label "" = no text"""
    gid = (label or "can")[:3] + body[1:4]
    return (f'<svg viewBox="0 0 150 260" width="{w}" height="{h}"><defs><linearGradient id="cg{gid}" x1="0" x2="1"><stop offset="0" stop-color="{body}"/>'
            f'<stop offset=".45" stop-color="#ffffff" stop-opacity=".35"/><stop offset=".55" stop-color="{body}"/><stop offset="1" stop-color="{body}"/></linearGradient></defs>'
            f'<rect x="10" y="18" width="130" height="226" rx="22" fill="{body}"/><rect x="10" y="18" width="130" height="226" rx="22" fill="url(#cg{gid})" opacity=".55"/>'
            f'<rect x="22" y="6" width="106" height="20" rx="8" fill="#C7CED6"/><rect x="22" y="236" width="106" height="16" rx="7" fill="#C7CED6"/>'
            f'<path d="M10 120c40-30 90 30 130 0v40c-40 30-90-30-130 0z" fill="{stripe}" opacity=".9"/>'
            + (f'<text x="75" y="{130 + 0.36 * fs:.1f}" font-family="Poppins" font-weight="700" font-size="{fs}" text-anchor="middle" fill="{text}" stroke="{body}" stroke-width="5" stroke-linejoin="round" paint-order="stroke" transform="rotate(-90 75 130)">{label}</text>' if label else '') + '</svg>')
