'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, Loader2 } from 'lucide-react';

interface Region {
  id: string;
  name: string;
}

function LoginContent() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    provinceId: '',
    provinceName: '',
    cityId: '',
    cityName: '',
    address: ''
  });
  
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  const provinceRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
   const router = useRouter();
   const searchParams = useSearchParams();
   const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (isRegister) {
      fetchProvinces();
    }
  }, [isRegister]);

  useEffect(() => {
    if (formData.provinceId) {
      fetchCities(formData.provinceId);
    } else {
      setCities([]);
    }
  }, [formData.provinceId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target as Node)) {
        setShowProvinceDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoadingRegions(true);
      const res = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json');
      const data = await res.json();
      setProvinces(data);
    } catch (err) {
      console.error('Failed to fetch provinces');
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchCities = async (provinceId: string) => {
    try {
      setLoadingRegions(true);
      const res = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      const data = await res.json();
      setCities(data);
    } catch (err) {
      console.error('Failed to fetch cities');
    } finally {
      setLoadingRegions(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isRegister && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        provinceId: formData.provinceId,
        provinceName: formData.provinceName,
        cityId: formData.cityId,
        cityName: formData.cityName,
        address: formData.address
      } : {
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || (isRegister ? 'Registration failed' : 'Login failed'));
      }

      if (isRegister) {
        setIsRegister(false);
        setError('');
        alert('Registration successful! Please login.');
      } else {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProvinces = provinces.filter(p => p.name.toLowerCase().includes(provinceSearch.toLowerCase()));
  const filteredCities = cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase()));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className={`w-full ${isRegister ? 'max-w-2xl' : 'max-w-md'} rounded-lg bg-white p-8 shadow-md transition-all`}>
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          {isRegister ? 'Register User' : 'Login'}
        </h2>
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleAction}>
          <div className={`grid ${isRegister ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-x-6`}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            {isRegister && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            {isRegister && (
              <>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Re-type Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Telp / WA</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                {/* Province Search Dropdown */}
                <div className="mb-4 relative" ref={provinceRef}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Provinsi</label>
                  <div 
                    className="w-full rounded-md border border-gray-300 p-2 text-black flex justify-between items-center cursor-pointer bg-white"
                    onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  >
                    <span className={formData.provinceName ? 'text-black' : 'text-gray-400 font-normal'}>
                      {formData.provinceName || 'Pilih Provinsi'}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                  
                  {showProvinceDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            placeholder="Cari provinsi..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-500"
                            value={provinceSearch}
                            onChange={(e) => setProvinceSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="py-1">
                        {loadingRegions ? (
                           <div className="p-3 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                             <Loader2 size={14} className="animate-spin" /> Sedang memuat...
                           </div>
                        ) : filteredProvinces.length > 0 ? (
                          filteredProvinces.map(p => (
                            <div
                              key={p.id}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer font-bold"
                              onClick={() => {
                                setFormData({ ...formData, provinceId: p.id, provinceName: p.name, cityId: '', cityName: '' });
                                setShowProvinceDropdown(false);
                                setProvinceSearch('');
                              }}
                            >
                              {p.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-500">Tidak ada data</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* City Search Dropdown */}
                <div className="mb-4 relative" ref={cityRef}>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Kota / Kabupaten</label>
                  <div 
                    className={`w-full rounded-md border border-gray-300 p-2 text-black flex justify-between items-center cursor-pointer ${!formData.provinceId ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                    onClick={() => formData.provinceId && setShowCityDropdown(!showCityDropdown)}
                  >
                    <span className={formData.cityName ? 'text-black' : 'text-gray-400 font-normal'}>
                      {formData.cityName || (formData.provinceId ? 'Pilih Kota' : 'Pilih Provinsi dulu')}
                    </span>
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                  
                  {showCityDropdown && formData.provinceId && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                          <input
                            type="text"
                            placeholder="Cari kota..."
                            className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-500"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="py-1">
                        {loadingRegions ? (
                          <div className="p-3 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 size={14} className="animate-spin" /> Sedang memuat...
                          </div>
                        ) : filteredCities.length > 0 ? (
                          filteredCities.map(c => (
                            <div
                              key={c.id}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer font-bold"
                              onClick={() => {
                                setFormData({ ...formData, cityId: c.id, cityName: c.name });
                                setShowCityDropdown(false);
                                setCitySearch('');
                              }}
                            >
                              {c.name}
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-gray-500">Tidak ada data</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-6 md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">Alamat</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2 text-black focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700 disabled:bg-blue-300 font-bold"
          >
            {loading ? (isRegister ? 'Registering...' : 'Logging in...') : (isRegister ? 'Register' : 'Login')}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsRegister(false)} className="font-bold text-blue-600 hover:underline">
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsRegister(true)} className="font-bold text-blue-600 hover:underline">
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Security...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
