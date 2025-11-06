type MinimalUser = {
    first_name?: string | null;
    last_name?: string | null;
};

export function getInitials(user: MinimalUser) {
    const f = user.first_name?.[0] ?? '';
    const l = user.last_name?.[0] ?? '';
    return `${f}${l}`.toUpperCase();
}

export function avatarSeed(user: MinimalUser) {
    return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
}

export function avatarUrl(user: MinimalUser) {
    const seed = encodeURIComponent(avatarSeed(user));
    return `https://api.dicebear.com/9.x/fun-emoji/svg?backgroundType=gradientLinear,solid&seed=${seed}`;
}
