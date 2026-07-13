import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboards/analytics");
  }, [router]);

  return null;
};

export default Home;