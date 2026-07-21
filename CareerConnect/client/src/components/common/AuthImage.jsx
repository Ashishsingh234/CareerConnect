import React, { useEffect, useState, useRef } from 'react';
import axios from '../../services/api';
import api from '../../services/api';

// AuthImage: If `src` points to a protected /files/:id route, fetch it via axios (which attaches Authorization)
// and create an object URL to use as img src. Otherwise render the plain src.
export default function AuthImage({ src, alt = '', className = '', fallback = null }) {
  const [imgSrc, setImgSrc] = useState(null);
  const createdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // clean previous
    if (createdRef.current) {
      URL.revokeObjectURL(createdRef.current);
      createdRef.current = null;
    }

    if (!src) {
      setImgSrc(null);
      return;
    }

    // Normalize absolute URLs that contain /public-files/ or /files/ to pathnames so they hit our logic below
    if (typeof src === 'string' && src.startsWith('http')) {
      try {
        const parsed = new URL(src);
        // If the path includes our public/protected prefixes, convert to pathname
        if (parsed.pathname.startsWith('/public-files/') || parsed.pathname.startsWith('/files/')) {
          src = parsed.pathname; // continue processing as a relative path
        } else {
          // Otherwise treat as a normal absolute image URL
          setImgSrc(src);
          return;
        }
      } catch (e) {
        // If URL parsing fails, fall back to treating src as-is
      }
    }

    // If this looks like a public file path, convert to absolute backend URL so browser requests the backend
    if (typeof src === 'string' && src.startsWith('/public-files/')) {
      const base = api.defaults?.baseURL || window.location.origin;
      const publicUrl = new URL(src, base).toString();
      setImgSrc(publicUrl);
      return;
    }

    // If this looks like our protected files endpoint, fetch as blob with axios (which adds the token)
    if (typeof src === 'string' && src.startsWith('/files/')) {
      (async () => {
        console.debug('AuthImage: attempting protected fetch for', src);
        try {
          const res = await axios.get(src, { responseType: 'blob' });
          if (cancelled) return;
          const url = URL.createObjectURL(res.data);
          createdRef.current = url;
          console.debug('AuthImage: protected fetch success, created blob url');
          setImgSrc(url);
        } catch (err) {
          console.warn('AuthImage protected fetch failed, trying public fallback', err?.response?.status);
          if (cancelled) return;
          // if authorization failed, try the public files endpoint without token
          try {
            const publicPath = src.replace('/files/', '/public-files/');
            const base = api.defaults?.baseURL || window.location.origin;
            const publicUrl = new URL(publicPath, base).toString();
            console.debug('AuthImage: attempting public fallback fetch for', publicUrl);
            const r = await fetch(publicUrl);
            if (!r.ok) throw new Error(`Public fetch failed: ${r.status}`);
            const blob = await r.blob();
            const url = URL.createObjectURL(blob);
            createdRef.current = url;
            console.debug('AuthImage: public fallback success, created blob url');
            setImgSrc(url);
          } catch (err2) {
            console.error('AuthImage public fallback failed', err2);
            if (!cancelled) setImgSrc(null);
          }
        }
      })();
    } else {
      // regular public URL (absolute or relative). If it's relative (starts with '/'), convert to backend base
      if (typeof src === 'string' && src.startsWith('/')) {
        const base = api.defaults?.baseURL || window.location.origin;
        const absolute = new URL(src, base).toString();
        setImgSrc(absolute);
      } else {
        setImgSrc(src);
      }
    }

    return () => {
      cancelled = true;
      if (createdRef.current) {
        URL.revokeObjectURL(createdRef.current);
        createdRef.current = null;
      }
    };
  }, [src]);

  if (!imgSrc) return fallback || null;
  return <img src={imgSrc} alt={alt} className={className} />;
}
