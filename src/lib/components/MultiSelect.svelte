<!-- MultiSelect.svelte -->
<script>
    // import { stat } from 'fs';

    //   export let values = [];
    //   export let selected = [];
    //   export let placeholder = "Filter...";

    let {
        values = [],
        selected = $bindable([]),
        placeholder = "Filter...",
    } = $props();

    let isOpen = $state(false);
    let searchTerm = $state("");
    let dropdown = $state();
    let trigger = $state();

    // Debug logging
    $effect(() => {
        console.log("=== MULTISELECT DEBUG ===");
        console.log("Values:", values);
        console.log("Selected:", selected);
        console.log("Placeholder:", placeholder);
        console.log("========================");
    });

    // Filter values based on search input
    let filteredValues = $derived(
        values.filter((v) =>
            v.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    // Toggle dropdown visibility
    function toggleDropdown() {
        isOpen = !isOpen;
        if (isOpen) {
            searchTerm = "";
            // Position dropdown on next tick to ensure DOM is updated
            // setTimeout(positionDropdown, 0);
        }
    }

    // Position dropdown relative to trigger element
    // function positionDropdown() {
    //     if (!dropdown || !trigger) return;

    //     const triggerRect = trigger.getBoundingClientRect();
    //     const dropdownElement = dropdown.querySelector(".dropdown");

    //     if (dropdownElement) {
    //         // Position below the trigger
    //         dropdownElement.style.top = `${triggerRect.bottom}px`;
    //         dropdownElement.style.left = `${triggerRect.left}px`;
    //         dropdownElement.style.width = `${triggerRect.width}px`;

    //         // Ensure dropdown stays in viewport
    //         const viewportHeight = window.innerHeight;
    //         const dropdownHeight = dropdownElement.offsetHeight;
    //         const spaceBelow = viewportHeight - triggerRect.bottom;

    //         if (
    //             spaceBelow < dropdownHeight &&
    //             triggerRect.top > dropdownHeight
    //         ) {
    //             // Not enough space below, position above
    //             dropdownElement.style.top = `${triggerRect.top - dropdownHeight}px`;
    //         }
    //     }
    // }

    // Handle selection change
    function handleChange(value, event) {
        if (event.target.checked) {
            selected = [...selected, value];
        } else {
            selected = selected.filter((v) => v !== value);
        }
    }

    // Close dropdown when clicking outside

    $effect(() => {
        function handleClickOutside(event) {
            if (dropdown && !dropdown.contains(event.target)) {
                isOpen = false;
            }
        }

        // Reposition on window resize
        // function handleResize() {
        //     if (isOpen) {
        //         positionDropdown();
        //     }
        // }

        document.addEventListener("click", handleClickOutside);
        // window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            // window.removeEventListener("resize", handleResize);
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
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <span class="arrow">{isOpen ? "▲" : "▼"}</span>
    </div>

    {#if isOpen}
        <div class="dropdown-overlay">
            <div class="dropdown">
                <input
                    type="text"
                    bind:value={searchTerm}
                    placeholder="Search..."
                    class="search"
                    onclick={handleClick}
                />
                <div class="options">
                    {#each filteredValues as value}
                        <label class="option">
                            <input
                                type="checkbox"
                                checked={selected.includes(value)}
                                onchange={(e) => handleChange(value, e)}
                                onclick={handleClick}
                            />
                            {value}
                        </label>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .multiselect {
        position: relative;
        display: inline-block;
        width: 200px;
    }

    .header {
        padding: 8px 12px;
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
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 1000;
    }

    .dropdown {
        border: 1px solid #ccc;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        margin-top: 4px;
        max-height: 300px;
        display: flex;
        flex-direction: column;
    }

    .search {
        width: 100%;
        padding: 8px 12px;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid #e0e0e0;
        font-size: 14px;
        outline: none;
    }

    .options {
        overflow-y: auto;
        max-height: 250px;
    }

    .option {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
    }

    .option:hover {
        background: #f5f5f5;
    }

    .option input {
        margin-right: 8px;
    }

    .multiselect.open .arrow {
        transform: rotate(180deg);
    }
</style>
