<!-- MultiSelect.svelte -->
<script>
    let {
        values: availableOptions = [],
        selected = $bindable([]),
        placeholder = "Filter...",
        onchange,
    } = $props();

    let isOpen = $state(false);
    let searchTerm = $state("");
    let dropdown = $state();
    let trigger = $state();
    let dropdownStyle = $state({});
    let transformStyle = $state("");

    // Debug logging
    $effect(() => {
        console.log("=== MULTISELECT DEBUG ===");
        console.log("Available:", availableOptions);
        console.log("Selected:", selected);
        console.log("Placeholder:", placeholder);
        console.log("========================");
    });

    // ✅ Track whether we're in "All" mode vs "None" mode
    let isAllMode = $state(true); // Start in All mode

    // Update isAllMode when selected changes programmatically
    $effect(() => {
        if (selected.length === availableOptions.length && availableOptions.length > 0) {
            isAllMode = true; // All items individually checked → enter All mode
        }
    });

    // Filter values based on search input
    let filteredValues = $derived(
        availableOptions.filter((v) =>
            v.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    // Check if all values are selected
    let allSelected = $derived(
        availableOptions.length === 0 ||
            selected?.length === 0 ||
            availableOptions.every((v) => selected.includes(v)),
    );

    // Check if all filtered values are selected (for Select All in filtered view)
    let allFilteredSelected = $derived(
        filteredValues.length > 0 &&
            selected?.length > 0 &&
            filteredValues.every((v) => selected.includes(v)),
    );

    // Toggle dropdown visibility
    function toggleDropdown() {
        isOpen = !isOpen;
        if (isOpen) {
            searchTerm = "";
            // Position dropdown on next tick to ensure DOM is updated
            setTimeout(positionDropdown, 0);
        }
    }

    // Position dropdown relative to viewport
    function positionDropdown() {
        if (!trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Calculate available space
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        // Default: position below
        let top = triggerRect.bottom;
        let left = triggerRect.left;
        let maxHeight = Math.min(300, spaceBelow - 10); // 10px margin

        // If not enough space below, position above
        if (spaceBelow < 200 && spaceAbove > spaceBelow) {
            top = triggerRect.top - 10; // 10px margin above
            maxHeight = Math.min(300, spaceAbove - 10);
        }

        // Ensure dropdown doesn't go off-screen horizontally
        const dropdownWidth = triggerRect.width;
        if (left + dropdownWidth > viewportWidth) {
            left = viewportWidth - dropdownWidth - 10;
        }

        // Ensure left doesn't go negative
        left = Math.max(10, left);

        dropdownStyle = {
            top: `${top}px`,
            left: `${left}px`,
            width: `${dropdownWidth}px`,
            maxHeight: `${maxHeight}px`,
        };

        // Reset transform for initial positioning
        transformStyle = "translate3d(0, 0, 0)";
    }

    // Handle selection change for individual options
    function handleChange(value, event) {
        if (event.target.checked) {
            selected = [...selected, value];
        } else {
            selected = selected.filter((v) => v !== value);
        }
        isAllMode = false; // ✅ Any manual change exits All mode

        if (onchange) {
            onchange(selected);
        }
    }

    // Handle All option selection
    function handleAllChange(event) {
        if (event.target.checked) {
            // Select all values (including those not in current filter)
            selected = [...availableOptions];
            isAllMode = true;
        } else {
            // Clear all selections
            selected = [];
            isAllMode = false; // ✅ This is the key: explicitly exit All mode
        }

        if (onchange) {
            onchange(selected);
        }        
    }

    // Handle Select All in filtered view
    function handleSelectAllFiltered() {
        if (allFilteredSelected) {
            // Remove all filtered values from selection
            selected = selected.filter((v) => !filteredValues.includes(v));
        } else {
            // Add all filtered values that aren't already selected
            const newSelections = filteredValues.filter(
                (v) => !selected.includes(v),
            );
            selected = [...selected, ...newSelections];
        }
    }

    // Clear all selections
    function clearAll() {
        selected = [];
    }

    // Use a more efficient scroll handler with requestAnimationFrame
    let scrollAnimationFrame = $state(null);

    function handleScroll() {
        if (!isOpen || !trigger) return;

        // Cancel previous animation frame to avoid multiple updates
        if (scrollAnimationFrame) {
            cancelAnimationFrame(scrollAnimationFrame);
        }

        // Use requestAnimationFrame for smoother updates
        scrollAnimationFrame = requestAnimationFrame(() => {
            const triggerRect = trigger.getBoundingClientRect();

            // Calculate new position using transform for better performance
            const newTop = triggerRect.bottom;
            const currentTop = parseFloat(dropdownStyle.top || "0");
            const deltaY = newTop - currentTop;

            // Only update transform if position changed significantly
            if (Math.abs(deltaY) > 0.5) {
                transformStyle = `translate3d(0, ${deltaY}px, 0)`;
            }

            scrollAnimationFrame = null;
        });
    }

    // Close dropdown when clicking outside and reposition on resize/scroll
    $effect(() => {
        function handleClickOutside(event) {
            if (dropdown && !dropdown.contains(event.target)) {
                isOpen = false;
            }
        }

        function handleResize() {
            if (isOpen) {
                positionDropdown();
            }
        }

        document.addEventListener("click", handleClickOutside);
        window.addEventListener("resize", handleResize);

        // Use passive scroll listener for better performance
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);

            if (scrollAnimationFrame) {
                cancelAnimationFrame(scrollAnimationFrame);
            }
        };
    });

    // Handle click events with stop propagation
    function handleClick(event) {
        event.stopPropagation();
    }
</script>

<div class="multiselect" bind:this={dropdown}>
    <div class="header" bind:this={trigger} onclick={toggleDropdown}>
        <span class="placeholder">
            {allSelected
                ? "All"
                : selected.length > 0
                  ? `${selected.length} selected`
                  : placeholder}
        </span>
        <span class="arrow">{isOpen ? "▲" : "▼"}</span>
    </div>

    {#if isOpen}
        <div
            class="dropdown-overlay"
            style:left={dropdownStyle.left}
            style:top={dropdownStyle.top}
            style:width={dropdownStyle.width}
            style:max-height={dropdownStyle.maxHeight}
            style:transform={transformStyle}
        >
            <div class="dropdown">
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Search..."
                    class="search"
                    onclick={handleClick}
                />
                <div class="options">
                    <!-- All option -->
                    <label class="option all-option">
                        <input
                            type="checkbox"
                            checked={isAllMode}
                            onchange={handleAllChange}
                            onclick={handleClick}
                        />
                        <span class="all-text">All</span>
                    </label>

                    <div class="divider"></div>

                    <!-- Select All Filtered option (only shown when searching) -->
                    {#if searchTerm && filteredValues.length > 0}
                        <label class="option select-all-filtered">
                            <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                onchange={handleSelectAllFiltered}
                                onclick={handleClick}
                            />
                            <span class="select-all-text"
                                >Select all "{searchTerm}"</span
                            >
                        </label>
                        <div class="divider"></div>
                    {/if}

                    <!-- Individual options -->
                    {#each filteredValues as value}
                        <label class="option">
                            <input
                                type="checkbox"
                                checked={isAllMode ||
                                    selected?.includes(value)}
                                onchange={(e) => handleChange(value, e)}
                                onclick={handleClick}
                            />
                            {value}
                        </label>
                    {/each}

                    <!-- Clear All button -->
                    {#if selected.length > 0}
                        <div class="actions">
                            <button class="clear-btn" onclick={clearAll}
                                >Clear All</button
                            >
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .multiselect {
        position: relative;
        display: inline-block;
        width: 100%;
    }

    .header {
        padding: 0px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        font-size: 14px;
        min-height: 36px;
    }

    .header:hover {
        border-color: #888;
    }

    .placeholder {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .arrow {
        font-size: 10px;
        color: #666;
        margin-left: 8px;
        transition: transform 0.2s;
    }

    .dropdown-overlay {
        position: fixed;
        z-index: 10000; /* Very high z-index to ensure it's above everything */
    }

    .dropdown {
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .search {
        width: 100%;
        padding: 8px 12px;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid #e0e0e0;
        font-size: 14px;
        outline: none;
        flex-shrink: 0;
    }

    .search:focus {
        border-color: #007acc;
    }

    .options {
        overflow-y: auto;
        min-height: 100px; /* Minimum height to ensure usability */
    }

    .option {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        flex-shrink: 0;
    }

    .option:hover {
        background: #f5f5f5;
    }

    .option input {
        margin-right: 8px;
    }

    .all-option {
        font-weight: 600;
        background-color: #f8f9fa;
    }

    .all-text {
        font-weight: 600;
    }

    .select-all-filtered {
        font-style: italic;
        background-color: #f0f8ff;
    }

    .select-all-text {
        font-style: italic;
        color: #007acc;
    }

    .divider {
        height: 1px;
        background-color: #e0e0e0;
        margin: 4px 0;
    }

    .actions {
        padding: 8px 12px;
        border-top: 1px solid #e0e0e0;
        background-color: #f8f9fa;
    }

    .clear-btn {
        background: none;
        border: 1px solid #dc3545;
        color: #dc3545;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        width: 100%;
    }

    .clear-btn:hover {
        background-color: #dc3545;
        color: white;
    }
</style>
