import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. replace container classes
    content = content.replace('<div className="form-layout-container">', '<div className="erp-layout">')
    content = content.replace('<div className="form-main-col">', '<div className="form-col">')
    content = content.replace('<div className="form-sidebar"', '<div className="rail" id="rail-summary"')
    content = content.replace('<div className="summary-container">', '<div className="erp-summary-card">')
    
    # 2. replace field classes
    content = content.replace('className="form-group"', 'className="erp-field"')
    content = content.replace('className="form-grid"', 'className="erp-grid erp-grid-3"')

    # 3. Replace <section className="form-section"> and <section className="card">
    #    with <SectionCard title="..." id="..." step="...">
    
    def replace_section(match):
        sec_content = match.group(0)
        # Find the header title
        h_match = re.search(r'<h3[^>]*>(.*?)</h3>', sec_content)
        title = h_match.group(1) if h_match else 'Мэдээлэл'
        
        # Remove the <h3 ...> from the content
        if h_match:
            sec_content = sec_content.replace(h_match.group(0), '')
            
        # determine step and id
        num_match = re.search(r'^(\d+)', title)
        step = num_match.group(1) if num_match else '*'
        id_str = f'sec{step}' if num_match else 'sec'
        
        # Replace the opening <section ...> with <SectionCard ...>
        sec_content = re.sub(r'^<section[^>]*>', f'<SectionCard id="{id_str}" step="{step}" title="{title}">', sec_content)
        
        # Replace the closing </section> with </SectionCard>
        sec_content = re.sub(r'</section>$', '</SectionCard>', sec_content)
        
        return sec_content

    # We need to find all <section ...> ... </section> accurately.
    content = re.sub(r'<section\b.*?</section>', replace_section, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Done')

process_file('src/components/orders/OrderForm.tsx')
