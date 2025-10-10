/**
 * Populate Firebase Database with CrewPosition-data.csv
 * 
 * Run this script in the browser console while logged in as admin
 * to populate the database with all crew positions from the CSV file.
 */

// Data from CrewPosition-data.csv
const csvData = [
  // Administration and guest service
  { category: "Administration and guest service", position: "assistant purser" },
  { category: "Administration and guest service", position: "guest service associate" },
  { category: "Administration and guest service", position: "hotel purser" },
  { category: "Administration and guest service", position: "HR officer" },
  { category: "Administration and guest service", position: "IT officer" },
  
  // Casino
  { category: "Casino", position: "cashier" },
  { category: "Casino", position: "casino host" },
  { category: "Casino", position: "casino manager" },
  { category: "Casino", position: "dealer" },
  { category: "Casino", position: "slot technician" },
  
  // Culinary and galley
  { category: "Culinary and galley", position: "baker" },
  { category: "Culinary and galley", position: "butcher" },
  { category: "Culinary and galley", position: "commis chef" },
  { category: "Culinary and galley", position: "executive chef" },
  { category: "Culinary and galley", position: "galley steward" },
  { category: "Culinary and galley", position: "pastry chef" },
  { category: "Culinary and galley", position: "sous chef" },
  
  // Entertainment - Brand specific
  { category: "Entertainment - Brand specific", position: "TDE (Royal Caribbean)" },
  
  // Entertainment - Cast and musician / specialty performer
  { category: "Entertainment - Cast and musician / specialty performer", position: "band musician" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "diver" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "ice skater" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "music director" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "orchestra musician" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "production dancer" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "production vocalist" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "scuba diver" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "slackliner" },
  { category: "Entertainment - Cast and musician / specialty performer", position: "synchronized swimmer" },
  
  // Entertainment - Guest entertainer
  { category: "Entertainment - Guest entertainer", position: "acrobat" },
  { category: "Entertainment - Guest entertainer", position: "aerialist" },
  { category: "Entertainment - Guest entertainer", position: "comedian" },
  { category: "Entertainment - Guest entertainer", position: "dancer" },
  { category: "Entertainment - Guest entertainer", position: "hypnotist" },
  { category: "Entertainment - Guest entertainer", position: "juggler" },
  { category: "Entertainment - Guest entertainer", position: "lecturer" },
  { category: "Entertainment - Guest entertainer", position: "magician" },
  { category: "Entertainment - Guest entertainer", position: "multi‑instrumentalist" },
  { category: "Entertainment - Guest entertainer", position: "musician" },
  { category: "Entertainment - Guest entertainer", position: "singer" },
  
  // Entertainment - Program and leadership
  { category: "Entertainment - Program and leadership", position: "activity host" },
  { category: "Entertainment - Program and leadership", position: "assistant cruise director" },
  { category: "Entertainment - Program and leadership", position: "cruise director" },
  { category: "Entertainment - Program and leadership", position: "entertainment host" },
  { category: "Entertainment - Program and leadership", position: "lifeguard" },
  { category: "Entertainment - Program and leadership", position: "pool attendant" },
  { category: "Entertainment - Program and leadership", position: "sport staff" },
  { category: "Entertainment - Program and leadership", position: "youth staff" },
  
  // Entertainment - Technical
  { category: "Entertainment - Technical", position: "automation technician" },
  { category: "Entertainment - Technical", position: "broadcast technician" },
  { category: "Entertainment - Technical", position: "costume technician" },
  { category: "Entertainment - Technical", position: "light technician" },
  { category: "Entertainment - Technical", position: "lounge technician" },
  { category: "Entertainment - Technical", position: "production manager" },
  { category: "Entertainment - Technical", position: "props technician" },
  { category: "Entertainment - Technical", position: "rigging technician" },
  { category: "Entertainment - Technical", position: "sound technician" },
  { category: "Entertainment - Technical", position: "stage manager" },
  { category: "Entertainment - Technical", position: "stage staff" },
  { category: "Entertainment - Technical", position: "video technician" },
  { category: "Entertainment - Technical", position: "wardrobe supervisor" },
  
  // Food and beverage
  { category: "Food and beverage", position: "assistant waiter" },
  { category: "Food and beverage", position: "bar manager" },
  { category: "Food and beverage", position: "barista" },
  { category: "Food and beverage", position: "bartender" },
  { category: "Food and beverage", position: "food and beverage director" },
  { category: "Food and beverage", position: "head waiter" },
  { category: "Food and beverage", position: "maitre d'" },
  { category: "Food and beverage", position: "restaurant manager" },
  { category: "Food and beverage", position: "room service attendant" },
  { category: "Food and beverage", position: "sommelier" },
  { category: "Food and beverage", position: "waiter" },
  
  // Hotel and housekeeping
  { category: "Hotel and housekeeping", position: "assistant hotel director" },
  { category: "Hotel and housekeeping", position: "butler" },
  { category: "Hotel and housekeeping", position: "cabin steward" },
  { category: "Hotel and housekeeping", position: "executive housekeeper" },
  { category: "Hotel and housekeeping", position: "florist" },
  { category: "Hotel and housekeeping", position: "hotel director" },
  { category: "Hotel and housekeeping", position: "housekeeping supervisor" },
  { category: "Hotel and housekeeping", position: "laundry attendant" },
  { category: "Hotel and housekeeping", position: "public area attendant" },
  { category: "Hotel and housekeeping", position: "royal genie" },
  
  // Medical
  { category: "Medical", position: "doctor" },
  { category: "Medical", position: "medical technician" },
  { category: "Medical", position: "nurse" },
  
  // Other
  { category: "Other", position: "crew manager" },
  { category: "Other", position: "crew welfare officer" },
  { category: "Other", position: "librarian" },
  { category: "Other", position: "training officer" },
  
  // Photo and media
  { category: "Photo and media", position: "photo gallery host" },
  { category: "Photo and media", position: "photographer" },
  { category: "Photo and media", position: "videographer" },
  
  // Retail and art
  { category: "Retail and art", position: "art associate" },
  { category: "Retail and art", position: "art auctioneer" },
  { category: "Retail and art", position: "jewelry specialist" },
  { category: "Retail and art", position: "retail manager" },
  { category: "Retail and art", position: "shop assistant" },
  
  // Shore excursion
  { category: "Shore excursion", position: "assistant shore excursion staff" },
  { category: "Shore excursion", position: "shore excursion manager" },
  { category: "Shore excursion", position: "tour escort" },
  
  // Spa, fitness and salon
  { category: "Spa, fitness and salon", position: "beautician" },
  { category: "Spa, fitness and salon", position: "fitness instructor" },
  { category: "Spa, fitness and salon", position: "hairdresser" },
  { category: "Spa, fitness and salon", position: "massage therapist" },
  { category: "Spa, fitness and salon", position: "personal trainer" },
  { category: "Spa, fitness and salon", position: "spa manager" },
  
  // Technical and deck
  { category: "Technical and deck", position: "able seaman" },
  { category: "Technical and deck", position: "bosun" },
  { category: "Technical and deck", position: "captain" },
  { category: "Technical and deck", position: "chief engineer" },
  { category: "Technical and deck", position: "deck officer" },
  { category: "Technical and deck", position: "electrician" },
  { category: "Technical and deck", position: "engineer" },
  { category: "Technical and deck", position: "HVAC technician" },
  { category: "Technical and deck", position: "oiler" },
  { category: "Technical and deck", position: "plumber" },
  { category: "Technical and deck", position: "quartermaster" },
  { category: "Technical and deck", position: "safety officer" },
  { category: "Technical and deck", position: "second engineer" },
  { category: "Technical and deck", position: "staff captain" },
  { category: "Technical and deck", position: "third engineer" }
];

// Import Firebase functions (these will be available in the browser console)
const { getDepartments, addDepartment, addRole } = window.firebaseFunctions || {};

async function populateDatabaseFromCSV() {
  console.log('🚀 Starting database population from CSV data...');
  
  try {
    // 1. Get existing departments
    const existingDepartments = await getDepartments();
    console.log('📋 Existing departments:', existingDepartments.map(d => d.name));
    
    // 2. Create department map
    const departmentMap = new Map();
    
    // 3. Process CSV data to extract unique departments
    const uniqueDepartments = new Set();
    csvData.forEach(item => {
      if (item.category.startsWith('Entertainment -')) {
        uniqueDepartments.add('Entertainment');
      } else {
        uniqueDepartments.add(item.category);
      }
    });
    
    console.log('📋 Unique departments to create:', Array.from(uniqueDepartments));
    
    // 4. Create departments
    for (const deptName of uniqueDepartments) {
      // Check if department already exists
      const existingDept = existingDepartments.find(d => d.name === deptName);
      
      if (existingDept) {
        console.log(`✅ Department already exists: ${deptName}`);
        departmentMap.set(deptName, existingDept.id);
      } else {
        try {
          const deptId = await addDepartment({
            name: deptName,
            description: `Department for ${deptName} roles`
          });
          console.log(`✅ Created department: ${deptName} (${deptId})`);
          departmentMap.set(deptName, deptId);
        } catch (error) {
          console.error(`❌ Failed to create department ${deptName}:`, error);
        }
      }
    }
    
    // 5. Create roles
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of csvData) {
      try {
        let departmentName;
        let subcategoryId = null;
        
        if (item.category.startsWith('Entertainment -')) {
          departmentName = 'Entertainment';
          subcategoryId = item.category.replace('Entertainment - ', '');
        } else {
          departmentName = item.category;
        }
        
        const departmentId = departmentMap.get(departmentName);
        
        if (!departmentId) {
          console.error(`❌ Department not found: ${departmentName}`);
          errorCount++;
          continue;
        }
        
        await addRole({
          name: item.position,
          departmentId: departmentId,
          subcategoryId: subcategoryId || undefined,
          description: `${item.position} role in ${departmentName}${subcategoryId ? ` - ${subcategoryId}` : ''}`
        });
        
        console.log(`✅ Added role: ${item.position} (${departmentName}${subcategoryId ? ` - ${subcategoryId}` : ''})`);
        successCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`❌ Failed to add role ${item.position}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Population complete!`);
    console.log(`✅ Success: ${successCount} roles`);
    console.log(`❌ Errors: ${errorCount} roles`);
    console.log(`📋 Departments: ${departmentMap.size}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Check the onboarding form');
    console.log('2. Select "Entertainment" department');
    console.log('3. You should see all Entertainment roles with subcategories');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Make function available globally
window.populateDatabaseFromCSV = populateDatabaseFromCSV;

console.log('🚀 CSV database population script loaded!');
console.log('Run: populateDatabaseFromCSV() to start');
