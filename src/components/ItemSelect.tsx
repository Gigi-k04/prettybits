import { useEffect, useRef, useState, type SelectHTMLAttributes } from "react";

// Fit the selected label to the actual field width, including inside modals.
// Native options retain their normal font size.
export function ItemSelect({
  style,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const ref = useRef<HTMLSelectElement>(null);
  const [fontSize, setFontSize] = useState<number>();

  useEffect(() => {
    const select = ref.current;
    if (!select) return;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let active = true;
    const fit = () => {
      if (!active || !context) return;
      const computed = getComputedStyle(select);
      const available =
        select.clientWidth -
        parseFloat(computed.paddingLeft) -
        parseFloat(computed.paddingRight) -
        2;
      context.font = `${computed.fontWeight} 12px ${computed.fontFamily}`;
      const width = context.measureText(select.selectedOptions[0]?.text ?? "").width;
      setFontSize(width > available ? Math.floor(((12 * available) / width) * 10) / 10 : undefined);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(select);
    void document.fonts.ready.then(fit);
    fit();
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [props.value, props.children]);

  return (
    <select
      {...props}
      ref={ref}
      className={`${className ?? ""} whitespace-nowrap [&>option]:text-xs`}
      style={{ ...style, fontSize }}
    />
  );
}
