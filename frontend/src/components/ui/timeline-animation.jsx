/**
 * TimelineContent
 * ─────────────────────────────────────────────────────────────────
 * A framer-motion wrapper that fires its animation once the parent
 * `timelineRef` element scrolls into view.
 *
 * Props
 *   as            – any HTML tag string ("h1", "p", "div", …)  default "div"
 *   animationNum  – passed as framer-motion's `custom` value so
 *                   variant functions can use it for staggered delays
 *   timelineRef   – ref of the ancestor section to observe
 *   customVariants– framer-motion variants object { hidden, visible }
 *   className     – Tailwind / CSS classes
 *   children      – content
 */
import { motion, useInView } from "framer-motion";

export function TimelineContent({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...rest
}) {
  const inView = useInView(timelineRef, {
    once: true,
    margin: "0px 0px -80px 0px",
  });

  // motion[tag] only works for standard HTML elements; fall back to motion.div
  const MotionTag =
    motion[as] ??
    (() => {
      const Tag = motion.div;
      return (props) => <Tag {...props} />;
    })();

  return (
    <MotionTag
      className={className}
      variants={customVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={animationNum}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export default TimelineContent;
