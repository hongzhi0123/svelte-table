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
            setTimeout(positionDropdown, 0);
        }
    }

    // Position dropdown relative to trigger element
    function positionDropdown() {
        if (!dropdown || !trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const dropdownElement = dropdown.querySelector(".dropdown");

        if (dropdownElement) {
            // Position below the trigger
            dropdownElement.style.top = `${triggerRect.bottom}px`;
            dropdownElement.style.left = `${triggerRect.left}px`;
            dropdownElement.style.width = `${triggerRect.width}px`;

            // Ensure dropdown stays in viewport
            const viewportHeight = window.innerHeight;
            const dropdownHeight = dropdownElement.offsetHeight;
            const spaceBelow = viewportHeight - triggerRect.bottom;

            if (
                spaceBelow < dropdownHeight &&
                triggerRect.top > dropdownHeight
            ) {
                // Not enough space below, position above
                dropdownElement.style.top = `${triggerRect.top - dropdownHeight}px`;
            }
        }
    }

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
        function handleResize() {
            if (isOpen) {
                positionDropdown();
            }
        }

        document.addEventListener("click", handleClickOutside);
        window.addEventListener("resize", handleResize);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<div class="multiselect" bind:this={dropdown}>
    <div class="header" onclick={toggleDropdown}>
        <span class="placeholder">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <span class="arrow">▼</span>
    </div>

    {#if isOpen}
        <div class="dropdown fixed">
            <input
                type="text"
                bind:value={searchTerm}
                placeholder="Search..."
                class="search"
            />
            <div class="options">
                {#each filteredValues as value}
                    <label class="option">
                        <input
                            type="checkbox"
                            checked={selected.includes(value)}
                            onchange={(e) => handleChange(value, e)}
                        />
                        {value}
                    </label>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .multiselect {
        position: relative;
        width: 200px;
    }

    .header {
        padding: 8px;
        border: 1px solid #ccc;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        background: white;
    }

    .dropdown {
        border: 1px solid #ccc;
        background: white;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .search {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
        border: none;
        border-bottom: 1px solid #ccc;
    }

    .options {
        max-height: 200px;
        overflow-y: auto;
    }

    .option {
        display: block;
        padding: 8px;
        cursor: pointer;
    }

    .option:hover {
        background: #f0f0f0;
    }

    .arrow {
        transition: transform 0.2s;
    }

    .multiselect.open .arrow {
        transform: rotate(180deg);
    }
</style>
