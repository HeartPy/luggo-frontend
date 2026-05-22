<template>
  <div class="space-y-10">
    <div
      v-if="isRepSectionRequired"
      class="space-y-6"
    >
      <StripeAccountAtomsFormTtl>代表者情報</StripeAccountAtomsFormTtl>
      <!-- 姓名 -->
      <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
        <div
          v-if="isFieldRequired('last_name_kanji')"
          class="max-w-sm sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium">姓<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.last_name_kanji"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.last_name_kanji,
              'cursor-not-allowed bg-gray-100 text-gray-500':
                isRepLastNameKanjiReadonly,
            }"
            :readonly="isRepLastNameKanjiReadonly"
            required
            aria-describedby="last_name_kanji-error"
            @input="updateFormData('last_name_kanji', $event)"
          >
          <div
            v-if="errors?.last_name_kanji"
            id="last_name_kanji-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.last_name_kanji }}
          </div>
        </div>
        <div
          v-if="isFieldRequired('first_name_kanji')"
          class="max-w-sm sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium">名<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.first_name_kanji"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.first_name_kanji,
              'cursor-not-allowed bg-gray-100 text-gray-500':
                isRepFirstNameKanjiReadonly,
            }"
            :readonly="isRepFirstNameKanjiReadonly"
            required
            aria-describedby="first_name_kanji-error"
            @input="updateFormData('first_name_kanji', $event)"
          >
          <div
            v-if="errors?.first_name_kanji"
            id="first_name_kanji-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.first_name_kanji }}
          </div>
        </div>
      </div>

      <!-- 姓名（カナ） -->
      <div
        v-if="
          isFieldRequired('first_name_kana') ||
            isFieldRequired('last_name_kana')
        "
        class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3"
      >
        <div
          v-if="isFieldRequired('last_name_kana')"
          class="max-w-sm sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium">姓（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.last_name_kana"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.last_name_kana,
              'cursor-not-allowed bg-gray-100 text-gray-500':
                isRepLastNameKanaReadonly,
            }"
            :readonly="isRepLastNameKanaReadonly"
            required
            aria-describedby="last_name_kana-error"
            @input="updateFormData('last_name_kana', $event)"
          >
          <div
            v-if="errors?.last_name_kana"
            id="last_name_kana-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.last_name_kana }}
          </div>
        </div>
        <div
          v-if="isFieldRequired('first_name_kana')"
          class="max-w-sm sm:max-w-full"
        >
          <label class="mb-1 block text-sm font-medium">名（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.first_name_kana"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500': errors?.first_name_kana,
              'cursor-not-allowed bg-gray-100 text-gray-500':
                isRepFirstNameKanaReadonly,
            }"
            :readonly="isRepFirstNameKanaReadonly"
            required
            aria-describedby="first_name_kana-error"
            @input="updateFormData('first_name_kana', $event)"
          >
          <div
            v-if="errors?.first_name_kana"
            id="first_name_kana-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors.first_name_kana }}
          </div>
        </div>
      </div>

      <!-- 役職（法人のみ） -->
      <div
        v-if="isBusinessTypeCompany && isFieldRequired('rep_title')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">役職<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.rep_title"
          type="text"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.rep_title }"
          required
          aria-describedby="rep_title-error"
          placeholder="例）代表取締役"
          @input="updateFormData('rep_title', $event)"
        >
        <div
          v-if="errors?.rep_title"
          id="rep_title-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.rep_title }}
        </div>
      </div>

      <!-- 生年月日 -->
      <div
        v-if="isFieldRequired('rep_dob')"
        class="max-w-60"
      >
        <label class="mb-1 block text-sm font-medium">生年月日<span class="ml-[0.2em] text-red-600">*</span></label>
        <div
          class="flex w-full justify-center rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{
            'border-red-500':
              errors?.rep_dob ||
              errors?.['rep_dob.year'] ||
              errors?.['rep_dob.month'] ||
              errors?.['rep_dob.day'],
          }"
        >
          <div class="min-w-0">
            <input
              ref="yearInputRef"
              :value="formData.rep_dob.year || ''"
              type="number"
              size="4"
              class="w-14 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="年"
              min="1900"
              :max="new Date().getFullYear()"
              required
              aria-describedby="rep_dob-year-error"
              @input="handleYearInput($event)"
            >
          </div>
          <span class="text-sm">/</span>
          <div class="min-w-0">
            <input
              ref="monthInputRef"
              :value="formData.rep_dob.month || ''"
              type="number"
              size="2"
              class="w-10 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="月"
              min="1"
              max="12"
              required
              aria-describedby="rep_dob-month-error"
              @input="handleMonthInput($event)"
            >
          </div>
          <span class="text-sm">/</span>
          <div class="min-w-0">
            <input
              ref="dayInputRef"
              :value="formData.rep_dob.day || ''"
              type="number"
              size="2"
              class="w-10 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              placeholder="日"
              min="1"
              max="31"
              required
              aria-describedby="rep_dob-day-error"
              @input="handleDayInput($event)"
            >
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          半角数字で入力してください
        </p>
        <div
          v-if="
            errors?.rep_dob ||
              errors?.['rep_dob.year'] ||
              errors?.['rep_dob.month'] ||
              errors?.['rep_dob.day']
          "
          class="mt-1 text-sm text-red-500"
          aria-live="polite"
        >
          {{
            errors?.["rep_dob.year"] ||
              errors?.["rep_dob.month"] ||
              errors?.["rep_dob.day"] ||
              errors?.rep_dob ||
              "生年月日を正しく入力してください"
          }}
        </div>
      </div>

      <!-- 電話番号 -->
      <div
        v-if="isFieldRequired('rep_phone')"
        class="max-w-60"
      >
        <label class="mb-1 block text-sm font-medium">電話番号<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.rep_phone"
          type="tel"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.rep_phone }"
          placeholder="例) 09012345678"
          required
          aria-describedby="rep_phone-error"
          @input="updateFormData('rep_phone', $event)"
          @blur="handlePhoneBlur($event)"
        >
        <p class="mt-1 text-xs text-gray-500">
          半角数字で入力してください（ハイフンなし）
        </p>
        <div
          v-if="errors?.rep_phone"
          id="rep_phone-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.rep_phone }}
        </div>
      </div>

      <!-- メールアドレス -->
      <div
        v-if="isFieldRequired('rep_email')"
        class="max-w-sm"
      >
        <label class="mb-1 block text-sm font-medium">メールアドレス<span class="ml-[0.2em] text-red-600">*</span></label>
        <input
          :value="formData.rep_email"
          type="email"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': errors?.rep_email }"
          required
          aria-describedby="rep_email-error"
          @input="updateFormData('rep_email', $event)"
        >
        <div
          v-if="errors?.rep_email"
          id="rep_email-error"
          class="mt-1 text-sm text-red-600"
          aria-live="polite"
        >
          {{ errors.rep_email }}
        </div>
      </div>

      <!-- 住所 -->
      <div
        v-if="isAddressRequired()"
        class="space-y-6"
      >
        <!-- 郵便番号 -->
        <div
          v-if="isAddressFieldRequired('postal_code')"
          class="max-w-60"
        >
          <label class="mb-1 block text-sm font-medium">郵便番号<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.address_kanji.postal_code"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kanji.postal_code'] }"
            placeholder="例) 1234567"
            aria-describedby="address_kanji.postal_code-error"
            @input="handlePostalCodeInput($event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            半角数字で入力してください（ハイフンなし）
          </p>
          <div
            v-if="errors?.['address_kanji.postal_code']"
            id="address_kanji.postal_code-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kanji.postal_code"] }}
          </div>
        </div>

        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <!-- 都道府県 -->
          <div
            v-if="isKanjiAddressFieldRequired('state')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">都道府県<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.address_kanji.state"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors?.['address_kanji.state'] }"
              aria-describedby="address_kanji.state-error"
              @input="updateAddressKanjiFormData('state', $event)"
            >
            <div
              v-if="errors?.['address_kanji.state']"
              id="address_kanji.state-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["address_kanji.state"] }}
            </div>
          </div>
          <!-- 都道府県（カナ） -->
          <div
            v-if="isKanaAddressFieldRequired('state')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">都道府県（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.address_kana.state"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors?.['address_kana.state'] }"
              aria-describedby="address_kana.state-error"
              @input="updateAddressKanaFormData('state', $event)"
            >
            <div
              v-if="errors?.['address_kana.state']"
              id="address_kana.state-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["address_kana.state"] }}
            </div>
          </div>
        </div>

        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <!-- 市区町村 -->
          <div
            v-if="isKanjiAddressFieldRequired('city')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">市区町村<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.address_kanji.city"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors?.['address_kanji.city'] }"
              aria-describedby="address_kanji.city-error"
              @input="updateAddressKanjiFormData('city', $event)"
            >
            <div
              v-if="errors?.['address_kanji.city']"
              id="address_kanji.city-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["address_kanji.city"] }}
            </div>
          </div>
          <!-- 市区町村（カナ） -->
          <div
            v-if="isKanaAddressFieldRequired('city')"
            class="max-w-sm sm:max-w-full"
          >
            <label class="mb-1 block text-sm font-medium">市区町村（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="formData.address_kana.city"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors?.['address_kana.city'] }"
              aria-describedby="address_kana.city-error"
              @input="updateAddressKanaFormData('city', $event)"
            >
            <div
              v-if="errors?.['address_kana.city']"
              id="address_kana.city-error"
              class="mt-1 text-sm text-red-600"
              aria-live="polite"
            >
              {{ errors["address_kana.city"] }}
            </div>
          </div>
        </div>

        <!-- 町名・丁目 -->
        <div
          v-if="
            isKanjiAddressFieldRequired('town') ||
              isKanjiAddressFieldRequired('line1')
          "
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">町名・丁目</label>
          <input
            :value="formData.address_kanji.town"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kanji.town'] }"
            aria-describedby="address_kanji.town-error"
            placeholder="例) 千代田１丁目"
            @input="updateAddressKanjiFormData('town', $event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            町名・丁目がある場合は入力。番地のみの場合は空欄で可。
          </p>
          <div
            v-if="errors?.['address_kanji.town']"
            id="address_kanji.town-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kanji.town"] }}
          </div>
        </div>

        <!-- 番地 -->
        <div
          v-if="isKanjiAddressFieldRequired('line1')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">番地<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.address_kanji.line1"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kanji.line1'] }"
            aria-describedby="address_kanji.line1-error"
            placeholder="例) １－１"
            @input="updateAddressKanjiFormData('line1', $event)"
          >
          <div
            v-if="errors?.['address_kanji.line1']"
            id="address_kanji.line1-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kanji.line1"] }}
          </div>
        </div>

        <!-- 町名・丁目（カナ） -->
        <div
          v-if="
            isKanaAddressFieldRequired('town') ||
              isKanaAddressFieldRequired('line1')
          "
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">町名・丁目（カナ）</label>
          <input
            :value="formData.address_kana.town"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kana.town'] }"
            aria-describedby="address_kana.town-error"
            placeholder="例) チヨダ１チョウメ"
            @input="updateAddressKanaFormData('town', $event)"
          >
          <div
            v-if="errors?.['address_kana.town']"
            id="address_kana.town-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kana.town"] }}
          </div>
        </div>

        <!-- 番地（カナ） -->
        <div
          v-if="isKanaAddressFieldRequired('line1')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">番地（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="formData.address_kana.line1"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.['address_kana.line1'] }"
            aria-describedby="address_kana.line1-error"
            placeholder="例) １－１"
            @input="updateAddressKanaFormData('line1', $event)"
          >
          <div
            v-if="errors?.['address_kana.line1']"
            id="address_kana.line1-error"
            class="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {{ errors["address_kana.line1"] }}
          </div>
        </div>

        <!-- 建物名・部屋番号 -->
        <div
          v-if="isKanjiAddressFieldRequired('line2')"
          class="max-w-xl"
        >
          <label class="mb-1 block text-sm font-medium">建物名・部屋番号</label>
          <input
            :value="formData.address_kanji.line2"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="updateAddressKanjiFormData('line2', $event)"
          >
        </div>
      </div>
    </div>

    <!-- 取締役情報（法人のみ） -->
    <div
      v-if="isBusinessTypeCompany && isDirectorSectionRequired"
      class="space-y-6"
    >
      <StripeAccountAtomsFormTtl>取締役情報</StripeAccountAtomsFormTtl>
      <p class="text-sm text-gray-600">
        代表者以外の取締役がいる場合は、以下に追加してください。代表者は自動的に取締役として登録されます。
      </p>

      <div
        v-for="(director, index) in formData.directors"
        :key="index"
        class="space-y-6 rounded-lg border border-gray-200 bg-gray-50 p-6"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-800">
            取締役 {{ index + 1 }}
          </h3>
          <button
            type="button"
            class="text-sm text-red-600 hover:text-red-800"
            @click="removeDirector(index)"
          >
            削除
          </button>
        </div>

        <!-- 姓名 -->
        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <div class="max-w-sm sm:max-w-full">
            <label class="mb-1 block text-sm font-medium">姓<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.last_name_kanji"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.last_name_kanji`],
              }"
              required
              @input="updateDirectorField(index, 'last_name_kanji', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.last_name_kanji`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.last_name_kanji`] }}
            </div>
          </div>
          <div class="max-w-sm sm:max-w-full">
            <label class="mb-1 block text-sm font-medium">名<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.first_name_kanji"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.first_name_kanji`],
              }"
              required
              @input="updateDirectorField(index, 'first_name_kanji', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.first_name_kanji`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.first_name_kanji`] }}
            </div>
          </div>
        </div>

        <!-- 姓名（カナ） -->
        <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
          <div class="max-w-sm sm:max-w-full">
            <label class="mb-1 block text-sm font-medium">姓（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.last_name_kana"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500': errors?.[`directors.${index}.last_name_kana`],
              }"
              required
              @input="updateDirectorField(index, 'last_name_kana', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.last_name_kana`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.last_name_kana`] }}
            </div>
          </div>
          <div class="max-w-sm sm:max-w-full">
            <label class="mb-1 block text-sm font-medium">名（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.first_name_kana"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.first_name_kana`],
              }"
              required
              @input="updateDirectorField(index, 'first_name_kana', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.first_name_kana`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.first_name_kana`] }}
            </div>
          </div>
        </div>

        <!-- 役職 -->
        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium">役職<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="director.title"
            type="text"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.[`directors.${index}.title`] }"
            required
            @input="updateDirectorField(index, 'title', $event)"
          >
          <div
            v-if="errors?.[`directors.${index}.title`]"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors[`directors.${index}.title`] }}
          </div>
        </div>

        <!-- メールアドレス -->
        <div class="max-w-sm">
          <label class="mb-1 block text-sm font-medium">メールアドレス<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="director.email"
            type="email"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.[`directors.${index}.email`] }"
            required
            @input="updateDirectorField(index, 'email', $event)"
          >
          <div
            v-if="errors?.[`directors.${index}.email`]"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors[`directors.${index}.email`] }}
          </div>
        </div>

        <!-- 電話番号 -->
        <div class="max-w-60">
          <label class="mb-1 block text-sm font-medium">電話番号<span class="ml-[0.2em] text-red-600">*</span></label>
          <input
            :value="director.phone"
            type="tel"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors?.[`directors.${index}.phone`] }"
            placeholder="例) 09012345678"
            required
            @input="updateDirectorField(index, 'phone', $event)"
            @blur="handleDirectorPhoneBlur(index, $event)"
          >
          <p class="mt-1 text-xs text-gray-500">
            半角数字で入力してください（ハイフンなし）
          </p>
          <div
            v-if="errors?.[`directors.${index}.phone`]"
            class="mt-1 text-sm text-red-600"
          >
            {{ errors[`directors.${index}.phone`] }}
          </div>
        </div>

        <!-- 生年月日 -->
        <div class="max-w-60">
          <label class="mb-1 block text-sm font-medium">生年月日<span class="ml-[0.2em] text-red-600">*</span></label>
          <div
            class="flex w-full justify-center rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            :class="{
              'border-red-500':
                errors?.[`directors.${index}.dob`] ||
                errors?.[`directors.${index}.dob.year`] ||
                errors?.[`directors.${index}.dob.month`] ||
                errors?.[`directors.${index}.dob.day`],
            }"
          >
            <div class="min-w-0">
              <input
                :ref="(el) => setDirectorYearInputRef(index, el)"
                :value="director.dob.year || ''"
                type="number"
                size="4"
                class="w-14 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="年"
                min="1900"
                :max="new Date().getFullYear()"
                required
                @input="handleDirectorYearInput(index, $event)"
              >
            </div>
            <span class="text-sm">/</span>
            <div class="min-w-0">
              <input
                :ref="(el) => setDirectorMonthInputRef(index, el)"
                :value="director.dob.month || ''"
                type="number"
                size="2"
                class="w-10 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="月"
                min="1"
                max="12"
                required
                @input="handleDirectorMonthInput(index, $event)"
              >
            </div>
            <span class="text-sm">/</span>
            <div class="min-w-0">
              <input
                :ref="(el) => setDirectorDayInputRef(index, el)"
                :value="director.dob.day || ''"
                type="number"
                size="2"
                class="w-10 min-w-0 px-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="日"
                min="1"
                max="31"
                required
                @input="handleDirectorDayInput(index, $event)"
              >
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            半角数字で入力してください
          </p>
          <div
            v-if="
              errors?.[`directors.${index}.dob`] ||
                errors?.[`directors.${index}.dob.year`] ||
                errors?.[`directors.${index}.dob.month`] ||
                errors?.[`directors.${index}.dob.day`]
            "
            class="mt-1 text-sm text-red-500"
            aria-live="polite"
          >
            {{
              errors?.[`directors.${index}.dob.year`] ||
                errors?.[`directors.${index}.dob.month`] ||
                errors?.[`directors.${index}.dob.day`] ||
                errors?.[`directors.${index}.dob`] ||
                "生年月日を正しく入力してください"
            }}
          </div>
        </div>

        <!-- 住所 -->
        <div class="space-y-4">
          <!-- 郵便番号 -->
          <div class="max-w-60">
            <label class="mb-1 block text-sm font-medium">郵便番号<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.address_kanji.postal_code"
              type="text"
              maxlength="7"
              placeholder="例) 1234567"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.address_kanji.postal_code`],
              }"
              @input="updateDirectorAddressKanji(index, 'postal_code', $event)"
              @blur="handleDirectorPostalCode(index, $event)"
            >
            <p class="mt-1 text-xs text-gray-500">
              半角数字で入力してください（ハイフンなし）
            </p>
            <div
              v-if="errors?.[`directors.${index}.address_kanji.postal_code`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.address_kanji.postal_code`] }}
            </div>
          </div>

          <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <!-- 都道府県 -->
            <div class="max-w-sm sm:max-w-full">
              <label class="mb-1 block text-sm font-medium">都道府県<span class="ml-[0.2em] text-red-600">*</span></label>
              <input
                :value="director.address_kanji.state"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500':
                    errors?.[`directors.${index}.address_kanji.state`],
                }"
                @input="updateDirectorAddressKanji(index, 'state', $event)"
              >
              <div
                v-if="errors?.[`directors.${index}.address_kanji.state`]"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors[`directors.${index}.address_kanji.state`] }}
              </div>
            </div>
            <!-- 都道府県（カナ） -->
            <div class="max-w-sm sm:max-w-full">
              <label class="mb-1 block text-sm font-medium">都道府県（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
              <input
                :value="director.address_kana.state"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500':
                    errors?.[`directors.${index}.address_kana.state`],
                }"
                @input="updateDirectorAddressKana(index, 'state', $event)"
              >
              <div
                v-if="errors?.[`directors.${index}.address_kana.state`]"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors[`directors.${index}.address_kana.state`] }}
              </div>
            </div>
          </div>

          <div class="grid max-w-xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-3">
            <!-- 市区町村 -->
            <div class="max-w-sm sm:max-w-full">
              <label class="mb-1 block text-sm font-medium">市区町村<span class="ml-[0.2em] text-red-600">*</span></label>
              <input
                :value="director.address_kanji.city"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500':
                    errors?.[`directors.${index}.address_kanji.city`],
                }"
                @input="updateDirectorAddressKanji(index, 'city', $event)"
              >
              <div
                v-if="errors?.[`directors.${index}.address_kanji.city`]"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors[`directors.${index}.address_kanji.city`] }}
              </div>
            </div>
            <!-- 市区町村（カナ） -->
            <div class="max-w-sm sm:max-w-full">
              <label class="mb-1 block text-sm font-medium">市区町村（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
              <input
                :value="director.address_kana.city"
                type="text"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="{
                  'border-red-500':
                    errors?.[`directors.${index}.address_kana.city`],
                }"
                @input="updateDirectorAddressKana(index, 'city', $event)"
              >
              <div
                v-if="errors?.[`directors.${index}.address_kana.city`]"
                class="mt-1 text-sm text-red-600"
              >
                {{ errors[`directors.${index}.address_kana.city`] }}
              </div>
            </div>
          </div>
          <!-- 町名・丁目 -->
          <div class="max-w-xl">
            <label class="mb-1 block text-sm font-medium">町名・丁目</label>
            <input
              :value="director.address_kanji.town"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.address_kanji.town`],
              }"
              placeholder="例) 千代田１丁目"
              @input="updateDirectorAddressKanji(index, 'town', $event)"
            >
            <p class="mt-1 text-xs text-gray-500">
              町名・丁目がある場合は入力。番地のみの場合は空欄で可。
            </p>
            <div
              v-if="errors?.[`directors.${index}.address_kanji.town`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.address_kanji.town`] }}
            </div>
          </div>
          <!-- 番地 -->
          <div class="max-w-xl">
            <label class="mb-1 block text-sm font-medium">番地<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.address_kanji.line1"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.address_kanji.line1`],
              }"
              placeholder="例) １－１"
              @input="updateDirectorAddressKanji(index, 'line1', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.address_kanji.line1`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.address_kanji.line1`] }}
            </div>
          </div>
          <!-- 町名・丁目（カナ） -->
          <div class="max-w-xl">
            <label class="mb-1 block text-sm font-medium">町名・丁目（カナ）</label>
            <input
              :value="director.address_kana.town"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.address_kana.town`],
              }"
              placeholder="例) チヨダ１チョウメ"
              @input="updateDirectorAddressKana(index, 'town', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.address_kana.town`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.address_kana.town`] }}
            </div>
          </div>
          <!-- 番地（カナ） -->
          <div class="max-w-xl">
            <label class="mb-1 block text-sm font-medium">番地（カナ）<span class="ml-[0.2em] text-red-600">*</span></label>
            <input
              :value="director.address_kana.line1"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="{
                'border-red-500':
                  errors?.[`directors.${index}.address_kana.line1`],
              }"
              placeholder="例) １－１"
              @input="updateDirectorAddressKana(index, 'line1', $event)"
            >
            <div
              v-if="errors?.[`directors.${index}.address_kana.line1`]"
              class="mt-1 text-sm text-red-600"
            >
              {{ errors[`directors.${index}.address_kana.line1`] }}
            </div>
          </div>
          <!-- 建物名・部屋番号-->
          <div class="max-w-xl">
            <label class="mb-1 block text-sm font-medium">建物名・部屋番号</label>
            <input
              :value="director.address_kanji.line2"
              type="text"
              class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="updateDirectorAddressKanji(index, 'line2', $event)"
            >
          </div>
        </div>
      </div>

      <button
        type="button"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        @click="addDirector"
      >
        + 取締役を追加
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type {
  Step2FormData,
  DirectorInfo,
} from "~/types/stripe-account-register";
import { usePostalCodeSearch } from "~/composables/usePostalCodeSearch";
import { useNumericInput } from "~/composables/useNumericInput";
import { useBusinessProfile } from "~/composables/useBusinessProfile";

type Props = {
  formData: Step2FormData;
  errors?: Record<string, string>;
  requiredFields?: string[];
};

const props = defineProps<Props>();

// フィールドが必須かどうかを判定
const isFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields) {
    // requiredFieldsが未指定の場合は全フィールドを表示（初回登録時）
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.includes(fieldName);
};

// 住所関連フィールドのいずれかが必須かどうかを判定
const isAddressRequired = (): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.some(
    field =>
      field.startsWith("address_kanji.") || field.startsWith("address_kana."),
  );
};

const isAddressFieldRequired = (fieldName: string): boolean => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return (
    props.requiredFields.includes(`address_kanji.${fieldName}`)
    || props.requiredFields.includes(`address_kana.${fieldName}`)
  );
};

const isKanjiAddressFieldRequired = (fieldName: string): boolean => {
  return isFieldRequired(`address_kanji.${fieldName}`);
};

const isKanaAddressFieldRequired = (fieldName: string): boolean => {
  return isFieldRequired(`address_kana.${fieldName}`);
};

type Emits = {
  "update:form-data": [formData: Step2FormData];
};

const emit = defineEmits<Emits>();

const { searchAddress, handlePostalCode } = usePostalCodeSearch();
const { normalizeNumericInput } = useNumericInput();
const { businessProfile } = useBusinessProfile();

// ビジネスプロフィールにデータがある場合のみ編集不可
const isRepLastNameKanjiReadonly = computed(() => {
  return !!businessProfile.value?.rep_last_name_kanji;
});
const isRepFirstNameKanjiReadonly = computed(() => {
  return !!businessProfile.value?.rep_first_name_kanji;
});
const isRepLastNameKanaReadonly = computed(() => {
  return !!businessProfile.value?.rep_last_name_kana;
});
const isRepFirstNameKanaReadonly = computed(() => {
  return !!businessProfile.value?.rep_first_name_kana;
});

const yearInputRef = ref<HTMLInputElement | null>(null);
const monthInputRef = ref<HTMLInputElement | null>(null);
const dayInputRef = ref<HTMLInputElement | null>(null);

// 取締役用のref配列
const directorYearInputRefs = ref<Map<number, HTMLInputElement | null>>(
  new Map(),
);
const directorMonthInputRefs = ref<Map<number, HTMLInputElement | null>>(
  new Map(),
);
const directorDayInputRefs = ref<Map<number, HTMLInputElement | null>>(
  new Map(),
);

// business_typeが'company'かどうかを判定
const isBusinessTypeCompany = computed(() => {
  return businessProfile.value?.business_type === "company";
});

const isRepSectionRequired = computed(() => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.some(
    field =>
      field === "last_name_kanji"
      || field === "first_name_kanji"
      || field === "last_name_kana"
      || field === "first_name_kana"
      || field === "rep_title"
      || field === "rep_dob"
      || field === "rep_phone"
      || field === "rep_email"
      || field.startsWith("address_kanji.")
      || field.startsWith("address_kana."),
  );
});

const isDirectorSectionRequired = computed(() => {
  if (!props.requiredFields) {
    return true;
  }
  if (props.requiredFields.length === 0) {
    return false;
  }
  return props.requiredFields.some(
    field => field === "directors" || field.startsWith("directors."),
  );
});

const updateFormData = (key: keyof Step2FormData, event: Event) => {
  const target = event.target as HTMLInputElement;
  const updatedData = { ...props.formData, [key]: target.value };
  emit("update:form-data", updatedData);
};

// 電話番号のフォーカスアウトハンドラー
const handlePhoneBlur = (event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    emit("update:form-data", {
      ...props.formData,
      rep_phone: value,
    });
  });
};

// 年の入力ハンドラー
const handleYearInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 4) {
    value = value.slice(0, 4);
    target.value = value;
  }
  const year = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      year: year,
    },
  });
  // 4桁入力されたら月のフィールドにフォーカス移動
  if (value.length === 4 && monthInputRef.value) {
    monthInputRef.value.focus();
  }
};

// 月の入力ハンドラー
const handleMonthInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const month = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      month: month,
    },
  });
  // 3-9を入力した時点で確定するので即座に切り替え
  // または、2桁入力され、かつ有効な月の値（1-12）の場合に切り替え
  if (
    (value.length === 1 && month >= 3 && month <= 9)
    || (value.length === 2 && month >= 1 && month <= 12)
  ) {
    if (dayInputRef.value) {
      dayInputRef.value.focus();
    }
  }
};

// 日の入力ハンドラー
const handleDayInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const day = value ? Number.parseInt(value, 10) : 0;
  emit("update:form-data", {
    ...props.formData,
    rep_dob: {
      ...props.formData.rep_dob,
      day: day,
    },
  });
};

// 漢字住所フィールドを更新
const updateAddressKanjiFormData = (
  field: keyof Step2FormData["address_kanji"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  emit("update:form-data", {
    ...props.formData,
    address_kanji: {
      ...props.formData.address_kanji,
      [field]: target.value,
    },
    // postal_code は address_kana にも同期
    ...(field === "postal_code" && {
      address_kana: {
        ...props.formData.address_kana,
        postal_code: target.value,
      },
    }),
    // 番地（漢字）と同一の値を番地（カナ）にも設定
    ...(field === "line1" && {
      address_kana: {
        ...props.formData.address_kana,
        line1: target.value,
      },
    }),
  });
};

// カナ住所フィールドを更新
const updateAddressKanaFormData = (
  field: keyof Step2FormData["address_kana"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  emit("update:form-data", {
    ...props.formData,
    address_kana: {
      ...props.formData.address_kana,
      [field]: target.value,
    },
    // postal_code は address_kanji にも同期
    ...(field === "postal_code" && {
      address_kanji: {
        ...props.formData.address_kanji,
        postal_code: target.value,
      },
    }),
  });
};

// 郵便番号入力ハンドラー
const handlePostalCodeInput = (event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (postalCode: string) => {
      emit("update:form-data", {
        ...props.formData,
        address_kanji: {
          ...props.formData.address_kanji,
          postal_code: postalCode,
        },
        address_kana: {
          ...props.formData.address_kana,
          postal_code: postalCode,
        },
      });
    },
    onSearch: async (postalCode: string) => {
      await searchAddressByPostalCode(postalCode);
    },
  });
};

// 郵便番号から住所を検索
const searchAddressByPostalCode = async (postalCode: string) => {
  const result = await searchAddress(postalCode, true);
  if (result) {
    emit("update:form-data", {
      ...props.formData,
      address_kanji: {
        ...props.formData.address_kanji,
        postal_code: result.postal_code,
        state: result.state,
        city: result.city,
        town: result.town,
      },
      address_kana: {
        ...props.formData.address_kana,
        postal_code: result.postal_code,
        state: result.state_kana || "",
        city: result.city_kana || "",
        town: result.town_kana || "",
      },
    });
  }
};

// 取締役を追加
const addDirector = () => {
  const newDirector: DirectorInfo = {
    title: "",
    last_name_kanji: "",
    first_name_kanji: "",
    last_name_kana: "",
    first_name_kana: "",
    email: "",
    phone: "",
    dob: { year: 0, month: 0, day: 0 },
    address_kanji: {
      postal_code: "",
      state: "",
      city: "",
      town: "",
      line1: "",
      line2: "",
    },
    address_kana: {
      postal_code: "",
      state: "",
      city: "",
      town: "",
      line1: "",
    },
  };
  emit("update:form-data", {
    ...props.formData,
    directors: [...(props.formData.directors || []), newDirector],
  });
};

// 取締役を削除
const removeDirector = (index: number) => {
  const directors = [...(props.formData.directors || [])];
  directors.splice(index, 1);
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
};

// 取締役フィールドを更新
const updateDirectorField = (
  index: number,
  field: keyof DirectorInfo,
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    [field]: target.value,
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
};

// 取締役の電話番号のフォーカスアウトハンドラー
const handleDirectorPhoneBlur = (index: number, event: Event) => {
  normalizeNumericInput(event, (value: string) => {
    const directors = [...(props.formData.directors || [])];
    const currentDirector = directors[index];
    if (!currentDirector) return;

    directors[index] = {
      ...currentDirector,
      phone: value,
    } as DirectorInfo;
    emit("update:form-data", {
      ...props.formData,
      directors,
    });
  });
};

// 取締役の年の入力ハンドラー
const handleDirectorYearInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 4) {
    value = value.slice(0, 4);
    target.value = value;
  }
  const year = value ? Number.parseInt(value, 10) : 0;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    dob: {
      ...currentDirector.dob,
      year: year,
    },
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
  if (value.length === 4 && directorMonthInputRefs.value.get(index)) {
    directorMonthInputRefs.value.get(index)?.focus();
  }
};

// 取締役の月の入力ハンドラー
const handleDirectorMonthInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const month = value ? Number.parseInt(value, 10) : 0;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    dob: {
      ...currentDirector.dob,
      month: month,
    },
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
  // 3-9を入力した時点で確定するので即座に切り替え
  // または、2桁入力され、かつ有効な月の値（1-12）の場合に切り替え
  if (
    (value.length === 1 && month >= 3 && month <= 9)
    || (value.length === 2 && month >= 1 && month <= 12)
  ) {
    if (directorDayInputRefs.value.get(index)) {
      directorDayInputRefs.value.get(index)?.focus();
    }
  }
};

// 取締役の日の入力ハンドラー
const handleDirectorDayInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;
  if (value.length > 2) {
    value = value.slice(0, 2);
    target.value = value;
  }
  const day = value ? Number.parseInt(value, 10) : 0;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    dob: {
      ...currentDirector.dob,
      day: day,
    },
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
};

// 取締役の住所（漢字）を更新
const updateDirectorAddressKanji = (
  index: number,
  field: keyof DirectorInfo["address_kanji"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    address_kanji: {
      ...currentDirector.address_kanji,
      [field]: target.value,
    },
    // postal_code は address_kana にも同期
    ...(field === "postal_code" && {
      address_kana: {
        ...currentDirector.address_kana,
        postal_code: target.value,
      },
    }),
    // 番地（漢字）と同一の値を番地（カナ）にも設定
    ...(field === "line1" && {
      address_kana: {
        ...currentDirector.address_kana,
        line1: target.value,
      },
    }),
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
};

// 取締役の住所（カナ）を更新
const updateDirectorAddressKana = (
  index: number,
  field: keyof DirectorInfo["address_kana"],
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  const directors = [...(props.formData.directors || [])];
  const currentDirector = directors[index];
  if (!currentDirector) return;

  directors[index] = {
    ...currentDirector,
    address_kana: {
      ...currentDirector.address_kana,
      [field]: target.value,
    },
    // postal_code は address_kanji にも同期
    ...(field === "postal_code" && {
      address_kanji: {
        ...currentDirector.address_kanji,
        postal_code: target.value,
      },
    }),
  } as DirectorInfo;
  emit("update:form-data", {
    ...props.formData,
    directors,
  });
};

// 取締役の郵便番号入力ハンドラー
const handleDirectorPostalCode = (index: number, event: Event) => {
  handlePostalCode(event, {
    onPostalCodeUpdate: (postalCode: string) => {
      const directors = [...(props.formData.directors || [])];
      const currentDirector = directors[index];
      if (!currentDirector) return;

      directors[index] = {
        ...currentDirector,
        address_kanji: {
          ...currentDirector.address_kanji,
          postal_code: postalCode,
        },
        address_kana: {
          ...currentDirector.address_kana,
          postal_code: postalCode,
        },
      } as DirectorInfo;
      emit("update:form-data", {
        ...props.formData,
        directors,
      });
    },
    onSearch: async (postalCode: string) => {
      await searchDirectorAddressByPostalCode(index, postalCode);
    },
  });
};

// 取締役の郵便番号から住所を検索
const searchDirectorAddressByPostalCode = async (
  index: number,
  postalCode: string,
) => {
  const result = await searchAddress(postalCode, true);
  if (result) {
    const directors = [...(props.formData.directors || [])];
    const currentDirector = directors[index];
    if (!currentDirector) return;

    directors[index] = {
      ...currentDirector,
      address_kanji: {
        ...currentDirector.address_kanji,
        postal_code: result.postal_code,
        state: result.state,
        city: result.city,
        town: result.town,
      },
      address_kana: {
        ...currentDirector.address_kana,
        postal_code: result.postal_code,
        state: result.state_kana || "",
        city: result.city_kana || "",
        town: result.town_kana || "",
      },
    } as DirectorInfo;
    emit("update:form-data", {
      ...props.formData,
      directors,
    });
  }
};

// 取締役の年入力refを設定
const setDirectorYearInputRef = (
  index: number,
  el: Element | ComponentPublicInstance | null,
) => {
  if (el && el instanceof HTMLInputElement) {
    directorYearInputRefs.value.set(index, el);
  }
};

// 取締役の月入力refを設定
const setDirectorMonthInputRef = (
  index: number,
  el: Element | ComponentPublicInstance | null,
) => {
  if (el && el instanceof HTMLInputElement) {
    directorMonthInputRefs.value.set(index, el);
  }
};

// 取締役の日入力refを設定
const setDirectorDayInputRef = (
  index: number,
  el: Element | ComponentPublicInstance | null,
) => {
  if (el && el instanceof HTMLInputElement) {
    directorDayInputRefs.value.set(index, el);
  }
};

onMounted(() => {
  const updatedData = { ...props.formData };
  let hasUpdates = false;

  // ビジネスプロフィールから姓名（漢字）を自動入力
  if (
    businessProfile.value?.rep_last_name_kanji
    && !props.formData.last_name_kanji
  ) {
    updatedData.last_name_kanji = businessProfile.value.rep_last_name_kanji;
    hasUpdates = true;
  }
  if (
    businessProfile.value?.rep_first_name_kanji
    && !props.formData.first_name_kanji
  ) {
    updatedData.first_name_kanji = businessProfile.value.rep_first_name_kanji;
    hasUpdates = true;
  }

  // ビジネスプロフィールから姓名（カナ）を自動入力
  if (
    businessProfile.value?.rep_last_name_kana
    && !props.formData.last_name_kana
  ) {
    updatedData.last_name_kana = businessProfile.value.rep_last_name_kana;
    hasUpdates = true;
  }
  if (
    businessProfile.value?.rep_first_name_kana
    && !props.formData.first_name_kana
  ) {
    updatedData.first_name_kana = businessProfile.value.rep_first_name_kana;
    hasUpdates = true;
  }

  // ビジネスプロフィールからメールアドレスを自動入力
  if (businessProfile.value?.company_email && !props.formData.rep_email) {
    updatedData.rep_email = businessProfile.value.company_email;
    hasUpdates = true;
  }

  if (hasUpdates) {
    emit("update:form-data", updatedData);
  }
});
</script>
