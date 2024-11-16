import React, { useState, FormEvent } from 'react'

// interface FormData {
//     income: number;
//     expenses: number;
//     goals: string;
// }

export function FinanceForm() {
    async function formSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
    }


    return (
        <form action='formSubmit' className='flex flex-col items-center gap-y-4'>
            <input type="number" className='border-black'/>
            <input type="number" className='border-black'/>
            <input type="text" className='border-black'/>

            <button type='submit'></button>
        </form>
    )

}