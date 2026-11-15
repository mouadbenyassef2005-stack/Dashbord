import { navigate, usePath } from "./router";
export const usePathname = usePath;
export const useRouter = () => ({ push: navigate, replace: navigate });
