import React, { useEffect, useState } from "react";
import { Settings, Map, Heart, Edit2, Check, X, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { TourCard } from "../components/TourCard";
import { RestaurantCard } from "../components/RestaurantCard";
import { MOCK_TOURS, MOCK_RESTAURANTS } from "../lib/data";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";

const API_URL = "http://localhost:5000";

type MeResponse = {
  _id?: string;
  email?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  taste_profile?: string[];
  favorites?: number[];
};

export const Profile = () => {
  const token = localStorage.getItem("token") || "";

  // DB states
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  // UI states
  const [isEditing, setIsEditing] = useState(false);

  type Restaurant = {
    id: number;
    name: string;
    rating: number;
    priceRange: string;
    tags: string[];
    image?: string;
    lat: number;
    lng: number;
    address?: string;
    district?: string;
  };

  const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // display fields
  const displayName = me?.username || "User";
  const displayPhone = me?.phone || "";
  const displayAvatar =
    me?.avatar || "https://i.pravatar.cc/150?u=default-user";

  // temp fields khi edit
  const [tempName, setTempName] = useState(displayName);
  const [tempPhone, setTempPhone] = useState(displayPhone);
  const [tempAvatar, setTempAvatar] = useState(displayAvatar);

  // ✅ giữ file avatar để upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // ✅ Preferences: chỉ còn Khẩu vị yêu thích
  const TASTE_OPTIONS = [
    "Any",
    "Vietnamese",
    "Street Food",
    "Drinks",
    "Seafood",
    "Hotpot & BBQ",
  ] as const;

  type Taste = (typeof TASTE_OPTIONS)[number];
  const [selectedTastes, setSelectedTastes] = useState<Taste[]>(["Any"]);

  // load profile từ DB
  useEffect(() => {
    const fetchMe = async () => {

      try {
        setLoading(true);

        if (!token) {
          setMe(null);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Fetch me failed");

        const data: MeResponse = await res.json();
        setMe(data);
        const favIds = Array.isArray((data as any)?.favorites) ? (data as any).favorites as number[] : [];
        if (!favIds.length) {
          setFavoriteRestaurants([]);
        } else {
          setFavLoading(true);
          try {
            const results = await Promise.all(
              favIds.map(async (rid) => {
                const r = await fetch(`${API_URL}/api/restaurants/${rid}`);
                if (!r.ok) return null;
                return (await r.json()) as Restaurant;
              })
            );
            setFavoriteRestaurants(results.filter(Boolean) as Restaurant[]);
          } finally {
            setFavLoading(false);
          }
        }

        // sync temp fields theo data vừa load
        const n = data?.username || "User";
        const p = data?.phone || "";
        const a = data?.avatar || "https://i.pravatar.cc/150?u=default-user";

        setTempName(n);
        setTempPhone(p);
        setTempAvatar(a);

        // ✅ sync taste_profile từ DB
        const tp =
          Array.isArray(data?.taste_profile) && data.taste_profile.length
            ? (data.taste_profile.filter((x) =>
              TASTE_OPTIONS.includes(x as Taste)
            ) as Taste[])
            : (["Any"] as Taste[]);
        setSelectedTastes(tp.length ? tp : ["Any"]);

        // reset file nếu đang có
        setAvatarFile(null);
      } catch (err) {
        console.error(err);
        toast.error("Cannot load profile");
        setMe(null);

      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // ✅ cleanup blob url khi đổi ảnh (tránh leak)
  useEffect(() => {
    return () => {
      if (tempAvatar?.startsWith("blob:")) {
        URL.revokeObjectURL(tempAvatar);
      }
    };
  }, [tempAvatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ giữ file để upload lúc Save
    setAvatarFile(file);

    // ✅ preview local (KHÔNG lưu blob url vào DB)
    const previewUrl = URL.createObjectURL(file);
    setTempAvatar(previewUrl);
  };

  const uploadAvatar = async (file: File) => {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // nếu BE không check auth thì có thể bỏ
      },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Upload avatar failed");

    return data.imageUrl as string;
  };

  const handleSaveProfile = async () => {
    try {
      if (!token) {
        toast.error("No token. Please login again.");
        return;
      }

      let finalAvatarUrl = me?.avatar || "";

      // ✅ nếu chọn ảnh mới thì upload trước
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile);
      }

      const payload = {
        username: tempName,
        phone: tempPhone,
        avatar: finalAvatarUrl,
      };

      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const updated: MeResponse = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(updated as any);

      setMe(updated);

      // sync temp theo DB trả về
      const n = updated?.username || "User";
      const p = updated?.phone || "";
      const a = updated?.avatar || "https://i.pravatar.cc/150?u=default-user";

      setTempName(n);
      setTempPhone(p);
      setTempAvatar(a);

      // reset file
      setAvatarFile(null);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Update profile failed");
    }
  };

  const handleCancelEdit = () => {
    const n = me?.username || "User";
    const p = me?.phone || "";
    const a = me?.avatar || "https://i.pravatar.cc/150?u=default-user";

    setTempName(n);
    setTempPhone(p);
    setTempAvatar(a);

    // reset file chọn tạm
    setAvatarFile(null);

    setIsEditing(false);
  };

  // ✅ Toggle taste chuẩn theo rule Any
  const toggleTaste = (taste: Taste) => {
    setSelectedTastes((prev) => {
      // click Any => chỉ còn Any
      if (taste === "Any") return ["Any"];

      // click món khác khi đang Any => bỏ Any
      const withoutAny = prev.filter((t) => t !== "Any");

      // toggle bình thường
      if (withoutAny.includes(taste)) {
        const next = withoutAny.filter((t) => t !== taste);
        return next.length ? next : ["Any"]; // bỏ hết => quay về Any
      }

      return [...withoutAny, taste];
    });
  };

  // ✅ Save taste_profile vào DB
  const saveTasteProfile = async () => {
    try {
      if (!token) {
        toast.error("Please login");
        return;
      }

      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taste_profile: selectedTastes,
        }),
      });

      const updated: MeResponse = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(updated as any);

      setMe(updated);

      const tp =
        Array.isArray(updated?.taste_profile) && updated.taste_profile.length
          ? (updated.taste_profile.filter((x) =>
            TASTE_OPTIONS.includes(x as Taste)
          ) as Taste[])
          : (["Any"] as Taste[]);
      setSelectedTastes(tp.length ? tp : ["Any"]);

      toast.success("Taste profile saved!");
    } catch (e) {
      console.error(e);
      toast.error("Save taste profile failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 pb-8 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 p-1 border-4 border-white shadow-lg">
                <img
                  src={isEditing ? tempAvatar : displayAvatar}
                  className="w-full h-full rounded-full object-cover"
                  alt="avatar"
                />
              </div>

              {isEditing && (
                <>
                  <label
                    htmlFor="avatarUpload"
                    className="mt-2 text-xs text-[#FF6B35] cursor-pointer hover:underline"
                  >
                    Change avatar
                  </label>
                  <input
                    id="avatarUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              {loading ? (
                <div className="text-slate-500">Loading profile...</div>
              ) : isEditing ? (
                <div className="space-y-3 mb-4">
                  {/* Name */}
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#FF6B35] rounded-lg font-bold text-xl outline-none"
                    placeholder="Your name"
                  />

                  {/* Phone */}
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate-600 outline-none"
                    placeholder="Phone number"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">
                    {displayName}
                  </h1>

                  <div className="flex flex-col gap-1 text-sm text-slate-500 mb-4">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Phone className="w-4 h-4 text-[#FF6B35]" />
                      <span>{displayPhone ? displayPhone : "No phone yet"}</span>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {selectedTastes.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-orange-50 text-[#FF6B35] rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Edit button */}
            <div className="flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden md:inline">Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs.Root defaultValue="tours">
          <Tabs.List className="flex border-b border-gray-200 mb-8">
            <Tabs.Trigger
              value="tours"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Map className="w-4 h-4" /> My Saved Tours
            </Tabs.Trigger>
            <Tabs.Trigger
              value="favorites"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Heart className="w-4 h-4" /> Favorite Restaurants
            </Tabs.Trigger>
            <Tabs.Trigger
              value="preferences"
              className="px-6 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-[#FF6B35] data-[state=active]:border-[#FF6B35] data-[state=active]:text-[#FF6B35] transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Preferences
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            value="tours"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_TOURS.map((tour) => (
                <div key={tour.id} className="h-full">
                  <TourCard tour={tour} />
                </div>
              ))}
            </div>
          </Tabs.Content>

          <Tabs.Content
            value="favorites"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favLoading ? (
                <p className="text-gray-500">Loading favorites...</p>
              ) : favoriteRestaurants.length === 0 ? (
                <p className="text-gray-400">No favorite restaurants yet.</p>
              ) : (
                favoriteRestaurants.map((r) => (
                  <Link key={r.id} to={`/restaurant/${r.id}`}>
                    <RestaurantCard restaurant={r as any} />
                  </Link>
                ))
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content
            value="preferences"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <div className="max-w-2xl bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Food Preferences
              </h2>

              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-3">
                  What do you like? (Khẩu vị yêu thích)
                </label>

                <div className="flex flex-wrap gap-2">
                  {TASTE_OPTIONS.map((taste) => {
                    const active = selectedTastes.includes(taste);

                    return (
                      <button
                        key={taste}
                        type="button"
                        onClick={() => toggleTaste(taste)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${active
                          ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-[#FF6B35]"
                          }`}
                      >
                        {taste}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Selected:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedTastes.length ? selectedTastes.join(", ") : "None"}
                  </span>
                </p>
              </div>

              <button
                onClick={saveTasteProfile}
                className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-bold hover:bg-[#e55a2b] transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};
