def calc(targetPages, pagesPerSheet, base_qty, extra_qty, front_color, back_color):
    press_sheet = targetPages / pagesPerSheet
    fullSheets = int(targetPages // pagesPerSheet)
    remainderPages = targetPages % pagesPerSheet
    
    # Make even
    if remainderPages % 2 != 0:
        remainderPages += 1
        
    halfLeaves = int(remainderPages // 2)
    fractionalSetups = halfLeaves.bit_count()  # Count number of 1s in binary
    
    setups = fullSheets + fractionalSetups
    
    total_paper = (press_sheet * base_qty) + (setups * extra_qty)
    
    plates_per_full = front_color + back_color
    plates_per_fraction = max(front_color, back_color)
    
    total_plates = (fullSheets * plates_per_full) + (fractionalSetups * plates_per_fraction)
    
    print(f"Pages: {targetPages}, Press sheets: {press_sheet}")
    print(f"Full sheets: {fullSheets}, Fractional Setups: {fractionalSetups}")
    print(f"Total Paper: {total_paper}")
    print(f"Total Plates: {total_plates}")

calc(204, 16, 300, 100, 4, 4)
calc(196, 16, 300, 100, 4, 4)
