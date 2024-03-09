import stripe
from app.api.deps import CurrentUser, SessionDep
from app.config import config
from app.models import Course, Customer, Purchase
from fastapi import APIRouter, HTTPException, Request, responses

router = APIRouter()

stripe.api_key = config.STRIPE_API_KEY


@router.post("/courses/{course_id}")
async def create_checkout_session(db: SessionDep, course_id: int, current_user: CurrentUser):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(detail="Course not found", status_code=404)

    purchase = (
        db.query(Purchase)
        .filter(
            Purchase.course_id == course_id,
            Purchase.owner_id == current_user.id,
        )
        .first()
    )
    if purchase:
        raise HTTPException(detail="Already purchased", status_code=400)

    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        stripe_customer = stripe.Customer.create(email=current_user.email)
        customer = Customer(
            user_id=current_user.id,
            course_id=course_id,
            stripe_customer_id=stripe_customer.id,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    checkout_session = stripe.checkout.Session.create(
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": course.title,
                    },
                    "unit_amount": round(course.price * 100),
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        customer=customer.stripe_customer_id,
        metadata={"user_id": customer.user_id, "course_id": course_id},
        success_url=f"{config.FRONTEND_URL}/courses/{course_id}?success=1",
        cancel_url=f"{config.FRONTEND_URL}/courses/{course_id}?cancel=1",
    )
    return checkout_session.url


@router.post("/webhook")
async def stripe_webhook(db: SessionDep, request: Request):
    payload = await request.body()
    event = None
    signature = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=config.STRIPE_WEBHOOK_SECRET,
            api_key=stripe.api_key,
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        payment = event["data"]["object"]
        user_id = payment["metadata"]["user_id"]
        course_id = payment["metadata"]["course_id"]

        if not (user_id and course_id):
            raise HTTPException(detail="Webhook Error: Missing metadata", status_code=400)

        purchase = Purchase(
            course_id=course_id,
            owner_id=user_id,
        )
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
    return HTTPException(detail="Success payment", status_code=200)
