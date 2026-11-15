import { navigate, toHash } from "./router";
export default function Link({ href, onClick, children, ...rest }: any) {
  return (
    <a
      {...rest}
      href={"#" + toHash(String(href))}
      onClick={(e: any) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(String(href));
      }}
    >
      {children}
    </a>
  );
}
