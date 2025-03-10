import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBookingSystem() {
  try {
    console.log('Starting booking system tests...');

    // 1. Create a test property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        name: 'Test Property',
        description: 'A test property for booking system',
        address: '123 Test St',
        status: 'available',
        daily_rate: 100,
        weekly_rate: 600,
        monthly_rate: 2000,
        images: ['https://example.com/test.jpg'],
      })
      .select()
      .single();

    if (propertyError) throw propertyError;
    console.log('✓ Test property created');

    // 2. Create a test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: `test${Date.now()}@example.com`,
      password: 'testpassword123',
    });

    if (userError) throw userError;
    console.log('✓ Test user created');

    // 3. Test booking creation
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        property_id: property.id,
        user_id: user.user.id,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        duration: 'weekly',
        status: 'confirmed',
        total_amount: 600,
        payment_intent_id: 'test_payment_intent',
      })
      .select()
      .single();

    if (bookingError) throw bookingError;
    console.log('✓ Test booking created');

    // 4. Verify property status updated
    const { data: updatedProperty, error: propertyUpdateError } = await supabase
      .from('properties')
      .select('status')
      .eq('id', property.id)
      .single();

    if (propertyUpdateError) throw propertyUpdateError;
    if (updatedProperty.status !== 'occupied') {
      throw new Error('Property status not updated to occupied');
    }
    console.log('✓ Property status updated');

    // 5. Test booking cancellation
    const { error: cancelError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);

    if (cancelError) throw cancelError;
    console.log('✓ Booking cancelled');

    // 6. Verify property status updated back to available
    const { data: finalProperty, error: finalPropertyError } = await supabase
      .from('properties')
      .select('status')
      .eq('id', property.id)
      .single();

    if (finalPropertyError) throw finalPropertyError;
    if (finalProperty.status !== 'available') {
      throw new Error('Property status not updated back to available');
    }
    console.log('✓ Property status updated back to available');

    // 7. Clean up test data
    const { error: cleanupError } = await supabase
      .from('properties')
      .delete()
      .eq('id', property.id);

    if (cleanupError) throw cleanupError;
    console.log('✓ Test data cleaned up');

    console.log('\nAll tests passed successfully! 🎉');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testBookingSystem(); 