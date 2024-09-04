```javascript
const fieldset = document.getElementById('syllable-fieldset');
const allCheckbox = document.getElementById('syllableAll');

const otherCheckboxes = Array.from(document.querySelectorAll('input[name="syllableChoice"]'))
                             .filter(checkbox => checkbox !== allCheckbox);
// attribute selector ကိုသုံးပြီး `name="syllableChoice"` ပါတဲ့ input အားလုံးကို array တစ်ခုဆောက် ၊ အဲ့ဒီ array ကိုမှ `.filter` ဆီထပ်ဖြတ်ခိုင်းပြီး `allCheckbox` မဟုတ်တာတွေကိုပဲ စစ်ထုတ်


fieldset.addEventListener('change', function(event) {
    if (event.target === allCheckbox) {
    // အကယ်လို့ နှိပ်လိုက်တာက allCheckbox ဖြစ်နေရင် ဒါကိုလုပ်

        if (allCheckbox.checked) {
        // allCheckbox ကို နှိပ်လိုက်တာ မှန်ပြီး ၊ check လုပ်ဖို့ နှိပ်တာဆိုရင် ဒါကိုလုပ်
            otherCheckboxes.forEach(checkbox => {
                checkbox.disabled = true;
                checkbox.checked = false; // Uncheck the others if "All" is checked
            });
        } else {
        // allCheckbox ကို နှိပ်လိုက်တာ မှန်ပြီး ၊ uncheck လုပ်ဖို့ နှိပ်တာ ဆိုရင် ဒါကိုလုပ်  
            otherCheckboxes.forEach(checkbox => checkbox.disabled = false);
        }
    } else {
    // အကယ်လို့ နှိပ်လိုက်တာက otherCheckboxes ဖြစ်နေရင် ဒါကိုလုပ်

        if (event.target.checked) {
        // otherCheckboxes ထဲက တစ်ခုခုကို နှိပ်ပြီး ၊ check လုပ်ဖို့ နှိပ်တာဆိုရင် ဒါလုပ်
            allCheckbox.disabled = true;
            allCheckbox.checked = false; // Uncheck "All" if any other is checked
        } else {
        // otherCheckboxes ထဲက တစ်ခုခုကို နှိပ်ပြီး ၊ uncheck လုပ်ဖို့ နှိပ်တာဆိုရင် ဒါကိုလုပ်  
            const anyChecked = otherCheckboxes.some(checkbox => checkbox.checked);
            // otherCheckboxes ထဲက တစ်ခုခုကို uncheck လုပ်လိုက်ပြီဆိုရင် Othercheckboxes ထဲက တခြားရော check လုပ်ထားတာ ရှိနေသေးလား စစ်ရမယ်။

            // ဒီ အတွက် `some()` ထဲကို ဖြတ်ခိုင်းမယ်။  တစ်ခုခု check ထားရင် true ပြန်မယ်။ 

            if (!anyChecked) {
            // အကယ်လို့ true မပြန်ထားဘူး (သဘောက check လုပ်ထားတဲ့ otherCheckboxes မရှိတော့ဘူး) ဆိုရင် allCheckbox ကို ပြန်ဖွင့်လို့ရပါပြီ။  
                allCheckbox.disabled = false;
            }
        }
    }
});
```