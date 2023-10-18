'use client'

import { Button, Container, Input, useToast } from '@chakra-ui/react';
import React, { useState, ChangeEvent } from 'react';
import * as cheerio from 'cheerio';
import { saveAs } from 'file-saver';
import { Parade } from '@/utils/Parade';
import { format, parse } from 'date-fns';
import { Workbook } from "exceljs";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null | undefined>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        description: 'Please upload a file',
        status: 'error',
        isClosable: true,
      });
      return;
    }
    if (!selectedFile.type.startsWith('text/html')) {
      toast({
        title: 'Only HTML files',
        description: 'Export chat history from telegram!',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Parade Data');
    worksheet.getColumn(1).key = "name";

    console.log('Selected file:', selectedFile.name);
    const fileContents = await selectedFile.text();
    const $ = cheerio.load(fileContents);

    const $duty_clerk_messages = $('div.message.default.clearfix div.text:contains("Parade State Summary")').parents('div.body');


    const reversedHtmlParades = $duty_clerk_messages.get();
    const htmlParades = reversedHtmlParades.reverse();

    htmlParades.forEach((htmlParade, index) => {
      const element = $(htmlParade);
      const timeElement = element.find('div.pull_right.date.details[title]').first();
      
      const datetimeRawStr = timeElement.attr('title');
      if (!datetimeRawStr) {
        return;
      }

      const paradeDate = parse(datetimeRawStr, 'dd.MM.yyyy HH:mm:ss \'UTC\'XXX', new Date());

      const rawParadeText = element.find('div.text').html();
      if (!rawParadeText) {
        return;
      }

      const cleanedParadeText = rawParadeText
        .replace(/<br>/g, '\n') // Replace <br> with \n
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' '); // Replace &nbsp; with a space

      const parade = new Parade(cleanedParadeText);

      const headingColumnIndex = index + 2;
      worksheet.getCell(1, headingColumnIndex).value = formatWithPeriod(paradeDate);
      worksheet.getColumn(headingColumnIndex).key = formatWithPeriod(paradeDate);

      const rawTrackedNames = worksheet.getColumn(1).values;
      const trackedNames = rawTrackedNames.filter(n => n);

      if (trackedNames.length < 1) {
        const attendances = parade.getAttendances();
        attendances.forEach((attendance, index) => {
          const nameIndex = index + 2;
          let row: any = {};
          row["name"] = attendance.name;
          row[formatWithPeriod(paradeDate)] = attendance.attendanceStatus;
          worksheet.insertRow(nameIndex, row);
        });
      } else {
        console.log(trackedNames);
        const attendances = parade.getAttendances();
        attendances.forEach(attendance => {
          const rowIndex = rawTrackedNames.indexOf(attendance.name);
          if (rowIndex < 2) {
            const lastRowIndex = rawTrackedNames.length;
            let row: any = {};
            row["name"] = attendance.name;
            row[formatWithPeriod(paradeDate)] = attendance.attendanceStatus;
            worksheet.insertRow(lastRowIndex, row);
            return;
          }
          const row = worksheet.getRow(rowIndex); // Rows are 1-based
          // console.log(attendance.name);
          // console.log(attendance.attendanceStatus);
          // console.log(formatWithPeriod(paradeDate));
          row.getCell(formatWithPeriod(paradeDate)).value = attendance.attendanceStatus;
        });
      }
    });

    const excelBlob = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'example.xlsx');
    setIsLoading(false);
  };

  return (
    <Container>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload} isLoading={isLoading}>
        Convert to Excel
      </Button>
    </Container>
  );
}

function formatWithPeriod(date: Date) {
  const hour = date.getHours();
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${format(date, 'dd MMM')} (${period})`;
}
