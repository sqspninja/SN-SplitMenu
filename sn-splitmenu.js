(function() {
  document.addEventListener("DOMContentLoaded", function() {
    // Read settings from the global object
    const settings = window.splitMenuSettings || {};
    const linkSpacing = settings.linkSpacing || 20;
    const elementSpacing = settings.elementSpacing || linkSpacing / 2;
    const heavySideLeft = settings.heavySideLeft !== undefined ? settings.heavySideLeft : true;

    const headerElement = document.querySelector("body #siteWrapper #header");

    if (!headerElement) {
      console.warn("Header element not found");
      return;
    }

    // Utility function to find elements
    const findElement = (selector, parent = document) => {
      const element = parent.querySelector(selector);
      if (!element) console.warn(`${selector} not found in the specified parent`);
      return element;
    };

    // Function to split menu items
    const splitMenuItems = (navList, heavySideLeft) => {
      const navItems = Array.from(navList.querySelectorAll(".header-nav-item"));
      const midpoint = Math.floor(navItems.length / 2);
      const extraItemSide = navItems.length % 2 === 1 ? (heavySideLeft ? "left" : "right") : null;

      navItems.forEach((item, index) => {
        item.classList.add("sn-split-menu-nav-item");
        if (index < midpoint || (index === midpoint && extraItemSide === "left")) {
          item.classList.add("sn-split-menu-nav-item-left", "sn-hide-right");
          item.setAttribute("aria-hidden", "true");
        } else {
          item.classList.add("sn-split-menu-nav-item-right", "sn-hide-left");
          item.setAttribute("aria-hidden", "true");
        }
      });
    };

    // Function to clone navigation element
    const cloneNavElement = (headerNav, heavySideLeft) => {
      const headerTitleNavWrapper = headerNav.closest(".header-title-nav-wrapper");
      const headerTitle = findElement(".header-title", headerTitleNavWrapper);
      if (!headerTitleNavWrapper || !headerTitle) return;

      const clonedNav = headerNav.cloneNode(true);
      clonedNav.classList.add("sn-split-menu-header-nav-left", "sn-split-menu-header-nav");
      headerNav.classList.add("sn-split-menu-header-nav-right", "sn-split-menu-header-nav");
      headerTitleNavWrapper.insertBefore(clonedNav, headerTitle);
      splitMenuItems(clonedNav, heavySideLeft);
      splitMenuItems(headerNav, heavySideLeft);
    };

    // Function to move elements
    const moveElement = (selector, targetSelector, { position = "beforebegin", clone = false } = {}) => {
      const element = findElement(selector);
      const target = findElement(targetSelector);
      if (element && target) {
        if (clone) {
          const clonedElement = element.cloneNode(true);
          clonedElement.classList.add("sn-hide-right");
          target.appendChild(clonedElement);
        } else {
          target.insertAdjacentElement(position, element);
        }
      }
    };

    // Function to calculate padding in VW units
    const calculatePaddingVW = () => {
      const headerAnnouncementBarWrapper = findElement(".header-announcement-bar-wrapper");
      if (!headerAnnouncementBarWrapper) return 0;

      const { paddingLeft, paddingRight } = getComputedStyle(headerAnnouncementBarWrapper);
      const viewportWidth = window.innerWidth;
      return ((parseFloat(paddingLeft) + parseFloat(paddingRight)) / viewportWidth) * 100;
    };

    // Function to calculate combined element widths
    const calculateCombinedElementWidths = () => {
      return [
        ".header-actions--left",
        ".header-actions--right",
        ".sn-split-menu-header-nav-left .header-nav-wrapper",
        ".sn-split-menu-header-nav-right .header-nav-wrapper",
        ".header-title"
      ].reduce((total, selector) => {
        const element = findElement(selector);
        return total + (element ? element.offsetWidth : 0);
      }, 0);
    };

    // Function to debounce other functions
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    // Function to check overflow breakpoint
    const checkOverflowBreakpoint = (minimumWidth) => {
      const headerElement = findElement(".sn-split-menu-header");
      if (headerElement) {
        headerElement.classList.toggle('sn-overflow', window.innerWidth <= minimumWidth);
      }
    };

    // Main initialization function
    const initializeSplitMenu = () => {
      headerElement.classList.add("sn-split-menu-header");
      document.body.classList.add("sn-split-menu");

      const currentStyles = headerElement.getAttribute("data-current-styles");
      if (currentStyles) {
        try {
          const styles = JSON.parse(currentStyles);
          const headerNav = findElement(".header-nav", headerElement);
          if (headerNav) {
            splitMenuItems(headerNav, heavySideLeft);
            cloneNavElement(headerNav, heavySideLeft);
          }

          if (styles.showButton) {
            moveElement(".header-actions.header-actions--right", ".sn-split-menu-header-nav-right", { position: "afterbegin" });
          }
          if (styles.showSocial) {
            moveElement(".header-actions.header-actions--left", ".sn-split-menu-header-nav-left", { position: "afterbegin" });
            moveElement(".header-actions.header-actions--left", ".sn-split-menu-header-nav-right", { clone: true });
          }
        } catch (e) {
          console.error("Failed to parse data-current-styles as JSON:", e);
        }
      }

      const totalPaddingVW = calculatePaddingVW();
      const combinedElementWidths = calculateCombinedElementWidths();
      const paddingInPixels = (totalPaddingVW / 2 / 100) * combinedElementWidths;
      const minimumWidth = combinedElementWidths + paddingInPixels * 2;

      checkOverflowBreakpoint(minimumWidth);
      window.addEventListener('resize', debounce(() => checkOverflowBreakpoint(minimumWidth), 100));
    };

    // Initialize the split menu
    initializeSplitMenu();
  });
})();
