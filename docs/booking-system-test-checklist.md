# Booking System Test Checklist

## Property Search and Filtering
- [ ] Navigate to /properties
- [ ] Verify property filters are working:
  - [ ] Location search
  - [ ] Duration selection (daily/weekly/monthly)
  - [ ] Price range filters
- [ ] Verify property cards display correctly:
  - [ ] Property images
  - [ ] Property details
  - [ ] Rental rates
  - [ ] Status badges

## Property Details
- [ ] Click on a property to view details
- [ ] Verify all property information is displayed:
  - [ ] Name and description
  - [ ] Address
  - [ ] Images gallery
  - [ ] Rental rates for different durations
- [ ] Verify property status is visible

## Booking Process
- [ ] Select a property and click "Book Now"
- [ ] Verify booking form:
  - [ ] Duration selection works
  - [ ] Date picker allows selecting dates
  - [ ] Total amount calculates correctly
  - [ ] Form validation works
- [ ] Test date restrictions:
  - [ ] Cannot select past dates
  - [ ] End date must be after start date
  - [ ] Minimum stay duration is enforced

## Payment Integration
- [ ] Complete booking form and proceed to payment
- [ ] Verify Stripe Elements are loaded
- [ ] Test payment flow:
  - [ ] Enter test card details
  - [ ] Verify payment processing
  - [ ] Check success/error messages
- [ ] Verify redirect after successful payment

## Booking Management
- [ ] Navigate to /bookings
- [ ] Verify booking list displays correctly:
  - [ ] Property details
  - [ ] Booking dates
  - [ ] Duration and total amount
  - [ ] Status badges
- [ ] Test booking cancellation:
  - [ ] Click cancel on a confirmed booking
  - [ ] Verify confirmation dialog
  - [ ] Check status updates
  - [ ] Verify property status changes

## Error Handling
- [ ] Test invalid dates
- [ ] Test booking unavailable properties
- [ ] Test payment failures
- [ ] Test network errors
- [ ] Verify error messages are clear and helpful

## Mobile Responsiveness
- [ ] Test on different screen sizes:
  - [ ] Mobile
  - [ ] Tablet
  - [ ] Desktop
- [ ] Verify all components are responsive:
  - [ ] Property cards
  - [ ] Booking form
  - [ ] Payment form
  - [ ] Booking list

## Security
- [ ] Verify authentication is required for:
  - [ ] Creating bookings
  - [ ] Viewing bookings
  - [ ] Cancelling bookings
- [ ] Test access control:
  - [ ] Cannot view other users' bookings
  - [ ] Cannot modify other users' bookings 