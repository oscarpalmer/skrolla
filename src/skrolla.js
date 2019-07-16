/*!
 * Skrolla, v0.8.0 - for scrolling to specific places on a page!
 * https://github.com/oscarpalmer/skrolla
 * (c) Oscar Palmér, 2019, MIT @license
 */
// eslint-disable-next-line no-unused-vars
const skrolla = (function skrolla() {
  // Reference to document window
  const win = window;
  // Document object for document window
  const doc = win.document;

  /**
   * State variables and options for Skrolla.
   */
  const Skrolla = {
    // Does a callback exist?
    hasCallback: false,
    // Is Skrolla active?
    isActive: false,
    options: {
      // No callback by default
      callback: null,
      // No offset for scrolling by default
      offset: 0,
    },
  };

  /**
   * Collection of animation methods.
   */
  const Animation = {
    /**
     * 'in-out-cubic'-easing function for nice animations.
     * Thanks, Benjamin; github.com/bendc/animateplus
     * @param {Float} progress Value for calculations
     * @return {Float} Calculated value
     */
    easing(progress) {
      const timesTwo = progress * 2;

      if (timesTwo < 1) {
        return 0.5 * (timesTwo ** 3);
      }

      const minusTwo = timesTwo - 2;

      return 0.5 * (minusTwo * (minusTwo ** 2) + 2);
    },

    /**
     * Get the absolute and highest value for duration for a single animation.
     * @param {Number} distance Distance to scroll
     * @return {Number} Duration of scroll
     */
    getDuration(distance) {
      return Math.ceil(Math.abs(distance));
    },
  };

  /**
   * Collection of DOM-methods.
   */
  const DOM = {
    /**
     * Get an element based on an ID,
     * or the document body if that's not possible.
     * @param {String} id ID for element
     * @return {Element} Found element
     */
    getElement(id) {
      return doc.getElementById(id) || doc.body;
    },

    /**
     * Get the offset value of an element.
     * @param {Element} element Element to inspect
     * @return {Number} Offset value
     */
    getOffset(element) {
      return element.getBoundingClientRect().top - Skrolla.options.offset;
    },

    /**
     * Get the target element for a specific scroll.
     * @param {Element|String} target ID for, or an actual element
     * @return {Element} Found element
     */
    getTarget(target) {
      // The target is already an element, so let's just return it
      if (target.nodeType) {
        return target;
      }

      // Call 'getElement' if it's a string and return its value,
      // or return the document body if the target is invalid
      return typeof target === 'string' ? DOM.getElement(target) : doc.body;
    },
  };

  /**
   * Collection of utility methods.
   */
  const Utils = {
    /**
     * Override the default options with ones supplied by the user.
     * @param {Object} options Object of options
     */
    setOptions(options) {
      // The object is bad, or not an actual object, so let's skip it
      if (options == null
          || ({}).toString.call(options) !== '[object Object]') {
        return;
      }

      // For all items in the object…
      Object.keys(options).forEach((key) => {
        // … overwrite matching values in Knuff's options
        Skrolla.options[key] = options[key];
      });

      // If a callback was added…
      if (options.callback != null
          && typeof options.callback === 'function') {
        // … set its state variable to true
        Skrolla.hasCallback = true;
      }
    },

    /**
     * The actual scrolling method for Skrolla,
     * called by both event handlers and 'skrolla.to';
     * @param {Element|String} target ID for, or element to scroll to
     * @param {Element|Window} origin Origin element or 'window'
     */
    scrollTo(target, origin) {
      // Offset value for the page
      const page = win.pageYOffset;

      // Target element for the scroll
      const element = DOM.getTarget(target);

      // Offset value for the target element
      const offset = DOM.getOffset(element);

      // Duration for the scroll
      const duration = Animation.getDuration(offset);

      // Start value for the animation,
      // to be overriden with the start of the first loop
      let start = null;

      /**
       * Method to loop for the scroll.
       * @param {Float} time Current time
       */
      const loop = (time) => {
        // First loop? Set the starting time
        if (start == null) {
          start = time;
        }

        // Elapsed time for the animation
        const elapsed = time - start;

        // Distance to cover during this incremental scroll
        const distance = offset * Animation.easing(elapsed / duration);

        // Scroll to a specific position
        win.scrollTo(0, page + distance);

        if (elapsed < duration) {
          // Animation and scrolling hasn't finished,
          // so let's call rFA to work its magic again
          return win.requestAnimationFrame(loop);
        }

        if (Skrolla.hasCallback) {
          // If the user added a callback, we'll call
          // it now that the scrolling has finished
          return Skrolla.options.callback.call(element, element, origin);
        }

        return null;
      };

      // Call 'requestAnimationFrame' with Skrolla's 'loop'-function
      win.requestAnimationFrame(loop);
    },
  };

  /**
   * Collection of event methods.
   */
  const Events = {
    /**
     * Method for adding event listeners to relevant elements.
     */
    addListeners() {
      // Get all elements that are Skrolla-friendly
      const elements = doc.querySelectorAll('[data-skrolla]');

      // Add an event listener for each element
      Array.prototype.forEach.call(elements, (element) => {
        element.addEventListener('click', Events.onClick);
      });
    },

    /**
     * The callback for events added to elements in 'addListeners'.
     * @param {Event} event Event details for a unique element
     */
    onClick(event) {
      // Prevent unnecessary events, like those for anchors
      event.preventDefault();

      // Get the target of the event
      const { target } = event;

      // Get the value of the 'data-skrolla'-attribute on the target
      const targetId = target.getAttribute('data-skrolla');

      // Call 'scrollTo' with both the targeted value and the event target
      Utils.scrollTo(targetId, target);
    },
  };

  /**
   * Method for initialising Skrolla.
   * @param {Object} options Object of options
   */
  const ret = (options) => {
    // If Skrolla is already active,
    // it should not be possible to activate it again
    if (Skrolla.isActive) {
      return;
    }

    // Set Skrolla to be active
    Skrolla.isActive = true;

    // Override the default options
    Utils.setOptions(options);

    // Add event listeners to appropriate elements
    Events.addListeners();
  };

  /**
   * Method to call for adding listeners to dynamic Skrolla-elements,
   * e.g. when loading elements with AJAX.
   */
  ret.reload = () => Events.addListeners();

  /**
   * Global method to directly scroll to an element.
   * @param {Element|String} target ID for, or an existing element
   */
  ret.to = (target) => {
    // Call 'skrollTo' with the target and window as parameters
    Utils.scrollTo(target, win);
  };

  // Return and expose public Skrolla methods
  return ret;
}());
