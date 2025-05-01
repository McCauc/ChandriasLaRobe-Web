import {
  appCredential,
  getFirestore,
  collection,
  addDoc
} from "./chandrias-sdk.js";

// Autofill the Name and Email fields with the currently logged-in user's information
import { auth, onAuthStateChanged } from "./assets/js/firebase-config.js";

// Updated to display an error message if adding to Firebase fails
$(document).ready(function () {
    // Add CSS for error state if not present
    $('<style>.btn-error { background: #e74c3c !important; color: #fff !important; border-color: #e74c3c !important; }</style>').appendTo('head');

    $("#place-rent-btn").on("click", async function (e) {
        e.preventDefault();

        const notyf = new Notyf({
            position: {
                x: "center",
                y: "top"
            }
        });

        // Validate form fields
        const customerName = $("#customer-name").val().trim();
        const customerEmail = $("#customer-email").val().trim();
        const phone = $("#customer-phone").val().trim();
        const checkoutDate = $("#checkout-date").val().trim();
        const checkoutTime = $("#checkout-time").val().trim();

        if (!customerName || !customerEmail || !phone || !checkoutDate || !checkoutTime) {
            // Show modal error if any required field is blank
            showErrorModal("Please fill in all required fields before placing your rental.");
            // Visually indicate error on the button
            $(this).addClass("btn-error");
            setTimeout(() => { $("#place-rent-btn").removeClass("btn-error"); }, 1500);
            return;
        }

        const chandriaDB = getFirestore(appCredential);
        const checkoutStatus = "Upcoming";

        try {
            // GET FORM DATA
            const productData = {
                customerName: customerName,
                customerEmail: customerEmail,
                phone: phone,
                checkoutDate: checkoutDate,
                checkoutTime: checkoutTime,
                checkoutStatus: checkoutStatus,
                createdAt: new Date()
            };

            // SAVE TO FIREBASE
            const docRef = await addDoc(
                collection(chandriaDB, "appointments"),
                productData
            );

            if (!docRef || !docRef.id) {
                throw new Error("Failed to add document to Firebase.");
            }

            notyf.success("Checkout successful! Your appointment has been saved.");

            // RESET FORM
            $("form")[0].reset();
        } catch (err) {
            console.error("Upload failed:", err);
            showErrorModal("There was an error uploading the appointment. Please try again.");
        }
    });
});

// Modal for error display
function showErrorModal(message) {
    // Remove any existing modal
    $("#error-modal").remove();
    // Create modal HTML
    const modalHtml = `
    <div id="error-modal" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:2em 2.5em;border-radius:10px;box-shadow:0 2px 16px rgba(0,0,0,0.2);text-align:center;max-width:90vw;">
            <h2 style="color:#e74c3c;margin-bottom:1em;">Error</h2>
            <p style="margin-bottom:1.5em;">${message}</p>
            <button id="close-error-modal" style="background:#e74c3c;color:#fff;border:none;padding:0.7em 2em;border-radius:5px;font-size:1em;cursor:pointer;">OK</button>
        </div>
    </div>`;
    // Append modal to body
    $("body").append(modalHtml);
    // Close modal on button click
    $("#close-error-modal").on("click", function() {
        $("#error-modal").remove();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    // Removed autofill logic for Name and Email fields
    // Ensure all fields except the special request textarea are required
    const formInputs = document.querySelectorAll(".form-input");
    formInputs.forEach((input) => {
        if (input.type !== "textarea") {
            input.setAttribute("required", "true");
        }
    });
});
