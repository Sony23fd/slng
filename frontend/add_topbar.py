import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    topbar_html = '''
    <div className="erp-main">
      <div className="erp-topbar">
        <div className="erp-topbar-row">
          <div>
            <h1 style={{margin:0, fontSize:'22px', fontWeight:700, display:'flex', alignItems:'center', gap:'10px'}}>
              <span className="erp-ic" style={{width:'30px', height:'30px', borderRadius:'8px', background:'var(--teal-tint)', color:'var(--teal-dark)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:'20px', height:'20px'}}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/></svg>
              </span> 
              {!initialData ? 'Шинэ захиалга / Үнэ бодох' : 'Захиалга засах'}
            </h1>
            <p style={{margin:'5px 0 0', color:'var(--muted)', fontSize:'13.6px', maxWidth:'560px'}}>
              Доорх алхмуудыг дараалан бөглөнө үү — баруун талд нийт үнэ, ашиг шууд шинэчлэгдэж харагдана.
            </p>
          </div>
          <div className="erp-progress-pill">
            <div className="erp-ring" style={{'--pct': 30} as React.CSSProperties}><i style={{width:'23px', height:'23px', borderRadius:'50%', background:'#fff', display:'block'}}></i></div>
            <span><b>Тооцоолол</b></span>
          </div>
        </div>
        <div className="erp-jumpnav" id="jumpnav">
          <a href="#sec1" className="erp-on">1. Захиалагч</a>
          <a href="#sec2">2. Захиалга</a>
          <a href="#sec3">3-5. Тех. мэдээлэл</a>
          <a href="#sec*">6. Материал</a>
          <a href="#sec*">7. Ажиллагаа</a>
          <a href="#sec*">8. Гадуур ажил</a>
          <a href="#rail-summary">Санхүү / Нийт үнэ</a>
        </div>
      </div>
'''

    # We need to replace:
    # <div>
    #   {!initialData && <h2 className="title">Шинэ захиалга үүсгэх</h2>}
    #   <form ...>
    #     {/* Бэлэн загвар сонгох */}
    #     <div style={{ marginBottom: ... }}> ... </div>
    #     <div className="erp-layout">
    #
    # With:
    # <div className="erp-shell">
    #   {topbar_html}
    #   <form ...>
    #     <div className="erp-layout">
    #       <div className="form-col">
    #         {/* templates */}
    #         ...
    
    # Let's just surgically replace things.
    content = re.sub(
        r'<div>\s*\{\!initialData && <h2 className="title">Шинэ захиалга үүсгэх</h2>\}\s*<form([^>]*)>',
        r'<div className="erp-shell">\n' + topbar_html + r'      <form\1>',
        content,
        flags=re.DOTALL
    )

    # Note: <form> wraps the whole erp-layout. But in the redesign, <form> should wrap the form elements.
    # It's fine if it wraps the whole layout.
    
    # Because we added <div className="erp-main">, we must close it before the last </div>
    # The ending is:
    #       </form>
    #     </div>
    #   );
    # }
    content = re.sub(
        r'</form>\s*</div>\s*\);\s*}',
        r'</form>\n    </div>\n    </div>\n  );\n}',
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Done")

process_file('src/components/orders/OrderForm.tsx')
