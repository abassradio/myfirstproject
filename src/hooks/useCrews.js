import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export const useCrews = () => {
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCrews = async () => {
      try {
        const { data, error: err } = await supabase.from("crews").select("*");
        if (err) throw err;
        if (!isMounted) return;
        setCrews(data || []);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCrews();
    return () => {
      isMounted = false;
    };
  }, []);

  const createCrew = async (crew) => {
    try {
      setError(null);
      const { data, error: err } = await supabase
        .from("crews")
        .insert(crew)
        .select("*")
        .single();
      if (err) throw err;
      setCrews((p) => [data, ...p]);
      return data;
    } catch (e) {
      setError(e.message || String(e));
      throw e;
    }
  };

  const deleteCrew = async (crewId) => {
    try {
      setError(null);
      const { error: err } = await supabase
        .from("crews")
        .delete()
        .eq("id", crewId);
      if (err) throw err;
      setCrews((p) => p.filter((c) => c.id !== crewId));
    } catch (e) {
      setError(e.message || String(e));
      throw e;
    }
  };

  return {
    crews,
    loading,
    error,
    createCrew,
    deleteCrew,
  };
};
