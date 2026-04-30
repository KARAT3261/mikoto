// Mock Data for the Japanese Guide Site

const MOCK_PLACES = [
    // Tokyo
    { id: "p1", name: "Перекрёсток Сибуя", city: "Токио", type: "culture", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=150&auto=format&fit=crop", cost: 0, time: "1-2 часа", lat: 35.6595, lng: 139.7005 },
    { id: "p2", name: "Акихабара (Электрический город)", city: "Токио", type: "anime", img: "https://images.unsplash.com/photo-1542931287-023b922fa89b?q=80&w=150&auto=format&fit=crop", cost: 5000, time: "3-4 часа", lat: 35.6983, lng: 139.7731 },
    { id: "p6", name: "Токийская башня", city: "Токио", type: "culture", img: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=150&auto=format&fit=crop", cost: 1200, time: "2 часа", lat: 35.6586, lng: 139.7454 },
    { id: "p7", name: "Парк Уэно", city: "Токио", type: "nature", img: "https://i.pinimg.com/736x/c1/5d/13/c15d13d8f3babfe2d33b9cc6d829bdb7.jpg", cost: 0, time: "2-3 часа", lat: 35.7141, lng: 139.7736 },
    { id: "p8", name: "Омоэдэ Ёкочо (Улочка памяти)", city: "Токио", type: "food", img: "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?q=80&w=150&auto=format&fit=crop", cost: 3000, time: "2 часа", lat: 35.6931, lng: 139.6994 },

    // Kyoto
    { id: "p3", name: "Храм Фусими Инари", city: "Киото", type: "culture", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=150&auto=format&fit=crop", cost: 0, time: "2-3 часа", lat: 34.9671, lng: 135.7726 },
    { id: "p4", name: "Бамбуковый лес Арасияма", city: "Киото", type: "nature", img: "https://i.pinimg.com/1200x/ff/5d/b1/ff5db183c38efac5a6c9f00ee465ff0e.jpg", cost: 0, time: "2 часа", lat: 35.0094, lng: 135.6668 },
    { id: "p9", name: "Золотой павильон (Кинкаку-дзи)", city: "Киото", type: "culture", img: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=150&auto=format&fit=crop", cost: 500, time: "1-2 часа", lat: 35.0394, lng: 135.7292 },
    { id: "p10", name: "Район Гион (Гейши)", city: "Киото", type: "culture", img: "https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?q=80&w=150&auto=format&fit=crop", cost: 0, time: "3 часа", lat: 35.0037, lng: 135.7736 },

    // Osaka
    { id: "p5", name: "Ичиран Рамен", city: "Осака", type: "food", img: "https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=150&auto=format&fit=crop", cost: 1500, time: "1 час", lat: 34.6687, lng: 135.5013 },
    { id: "p11", name: "Улица Дотонбори", city: "Осака", type: "food", img: "https://i.pinimg.com/1200x/86/27/13/862713368b906e0cc9d9be04546d6670.jpg", cost: 4000, time: "3-4 часа", lat: 34.6687, lng: 135.5012 },
    { id: "p12", name: "Осакский замок", city: "Осака", type: "culture", img: "https://i.pinimg.com/1200x/7d/bf/8c/7dbf8cbc450046d02d95a2b07ddefa6e.jpg", cost: 600, time: "2 часа", lat: 34.6873, lng: 135.5262 },
    { id: "p13", name: "Universal Studios Japan", city: "Осака", type: "anime", img: "https://i.pinimg.com/736x/f0/95/77/f0957772946a562efc1cd1ff4aff94fe.jpg", cost: 8400, time: "Весь день", lat: 34.6654, lng: 135.4323 },

    // Hokkaido / Sapporo
    { id: "p14", name: "Парк Одори", city: "Саппоро", type: "nature", img: "https://i.pinimg.com/736x/47/bc/25/47bc25d0f1df22cc4e4215d9b3cc8118.jpg", cost: 0, time: "2 часа", lat: 43.0611, lng: 141.3564 },
    { id: "p15", name: "Музей пива Саппоро", city: "Саппоро", type: "food", img: "https://images.unsplash.com/photo-1618218168350-6e7c81151b64?q=80&w=150&auto=format&fit=crop", cost: 2000, time: "2 часа", lat: 43.0728, lng: 141.3687 }
];

const TYPE_COLORS = {
    "culture": "#F59E0B", // Orange
    "anime": "#8B5CF6",   // Purple
    "food": "#EF4444",    // Red
    "nature": "#10B981"   // Green
};

const TYPE_LABELS = {
    "culture": "Культура",
    "anime": "Аниме",
    "food": "Еда",
    "nature": "Природа"
};
