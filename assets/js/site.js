
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const menu=$('#menuBtn'); if(menu) menu.addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
$$('[data-fallback]').forEach(img=>img.addEventListener('error',()=>{const div=document.createElement('div');div.className='product-placeholder';div.innerHTML='<span>Product image unavailable.<br>Use the Amazon button for the current listing.</span>';img.replaceWith(div);}));
